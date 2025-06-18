"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import type {
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import { useUser } from "@clerk/nextjs";
import { ModelSelectionNode } from "./nodes/model-selection-node";
import type { ModelSelectionNodeData } from "./nodes/model-selection-node";
import { TextInputNode } from "./nodes/text-input-node";
import type { TextInputNodeData } from "./nodes/text-input-node";
import { TextOutputNode } from "./nodes/text-output-node";
import type { TextOutputNodeData } from "./nodes/text-output-node";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelectedProjectStore } from "@/stores/selected-project-store";
import { Play, AlertTriangle, X } from "lucide-react";

import "@xyflow/react/dist/style.css";

interface NodeData extends Record<string, unknown> {
  label: string;
}

export type CustomNode = Node<
  NodeData | ModelSelectionNodeData | TextInputNodeData | TextOutputNodeData
>;
export type CustomEdge = Edge;

// Define node types for React Flow
const nodeTypes = {
  modelSelection: ModelSelectionNode,
  textInput: TextInputNode,
  textOutput: TextOutputNode,
};

// Editor project data structure
interface EditorProjectData {
  nodes: CustomNode[];
  edges: CustomEdge[];
  metadata?: {
    lastSaved: string;
    version: string;
  };
}

interface EditorProps {
  onSave?: (success: boolean) => void;
  onAuthRequired?: () => void; // Callback to trigger sign-in
  autoSave?: boolean; // Default true
}

const defaultNodes: CustomNode[] = [];
const defaultEdges: CustomEdge[] = [];

export function Editor({
  onSave,
  onAuthRequired,
  autoSave = true,
}: EditorProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<CustomNode>(defaultNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<CustomEdge>(defaultEdges);
  const [commandOpen, setCommandOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | "local"
  >("saved");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<
    "idle" | "running" | "completed" | "error"
  >("idle");
  const [executionErrors, setExecutionErrors] = useState<string[]>([]);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(
    null,
  );
  const [executionProgress, setExecutionProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });
  const eventSourceRef = useRef<EventSource | null>(null);
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nodesRef = useRef<CustomNode[]>(nodes);
  const edgesRef = useRef<CustomEdge[]>(edges);
  const saveQueueRef = useRef<boolean>(false);

  // Authentication state
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;

  // Selected project from store
  const { selectedProject, selectProject, clearSelection } =
    useSelectedProjectStore();

  // Use selected project UUID
  const currentProjectId = selectedProject?.uuid;

  // tRPC utils for cache management
  const trpcUtils = api.useUtils();

  // Load project data if currentProjectId is provided and user is authenticated
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = api.projects.getById.useQuery(
    { uuid: currentProjectId! },
    {
      enabled: !!currentProjectId && isAuthenticated,
      retry: (failureCount, error) => {
        // If project not found, clear it from store
        if (error.data?.code === "NOT_FOUND") {
          clearSelection();
          return false;
        }
        return failureCount < 3;
      },
    },
  );

  // Start execution mutation (SSE-based)
  const startExecution = api.execution.startExecution.useMutation({
    onMutate: () => {
      setExecutionStatus("running");
      setExecutionErrors([]);
      setExecutionProgress({ completed: 0, total: nodes.length });

      // Reset all node execution status
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            executionStatus: "idle",
            executionResult: undefined,
            executionError: undefined,
          },
        })),
      );
    },
    onSuccess: (result) => {
      if (result.success && result.executionId) {
        setCurrentExecutionId(result.executionId);
        // Connect to SSE stream
        connectToExecutionStream(result.executionId);
      } else {
        setExecutionStatus("error");
        setExecutionErrors([result.error ?? "Failed to start execution"]);
      }
    },
    onError: (error) => {
      setExecutionStatus("error");
      setExecutionErrors([
        String(error.message) ?? "Failed to start execution",
      ]);
    },
  });

  // Cancel execution mutation
  const cancelExecution = api.execution.cancelExecution.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        disconnectFromExecutionStream();
        setExecutionStatus("idle");
        setCurrentExecutionId(null);
      }
    },
    onError: (error) => {
      console.error("Failed to cancel execution:", error);
    },
  });

  // SSE connection functions
  const connectToExecutionStream = useCallback(
    (executionId: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `/api/execution/stream/${executionId}`,
      );
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as {
            type: string;
            data: {
              nodeId?: string;
              status?: "idle" | "running" | "completed" | "error";
              result?: unknown;
              error?: string;
              completedNodes?: number;
              totalNodes?: number;
              success?: boolean;
              errors?: string[];
            };
          };

          switch (data.type) {
            case "connected":
              console.log("Connected to execution stream:", data.data);
              break;

            case "progress":
              // Update node status in real-time
              const { nodeId, status, result, error } = data.data;

              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeId
                    ? {
                        ...node,
                        data: {
                          ...node.data,
                          executionStatus: status,
                          executionResult: result as string | undefined,
                          executionError: error,
                        } as typeof node.data,
                      }
                    : node,
                ),
              );

              // Update progress
              setExecutionProgress({
                completed: data.data.completedNodes ?? 0,
                total: data.data.totalNodes ?? 0,
              });
              break;

            case "complete":
              setExecutionStatus(data.data.success ? "completed" : "error");
              if (!data.data.success) {
                setExecutionErrors(data.data.errors ?? ["Execution failed"]);
              }
              setCurrentExecutionId(null);
              eventSource.close();
              break;

            case "cancelled":
              setExecutionStatus("idle");
              setCurrentExecutionId(null);
              eventSource.close();
              break;
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setExecutionStatus("error");
        setExecutionErrors(["Connection to execution stream failed"]);
        setCurrentExecutionId(null);
        eventSource.close();
      };
    },
    [setNodes],
  );

  const disconnectFromExecutionStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // tRPC mutations with optimistic updates and store integration
  const updateProject = api.projects.update.useMutation({
    onMutate: async (newData) => {
      setSaveStatus("saving");

      // Cancel outgoing refetches
      if (currentProjectId) {
        await trpcUtils.projects.getById.cancel({ uuid: currentProjectId });

        // Snapshot previous value
        const previousProject = trpcUtils.projects.getById.getData({
          uuid: currentProjectId,
        });

        // Optimistically update cache
        trpcUtils.projects.getById.setData({ uuid: currentProjectId }, (old) =>
          old
            ? {
                ...old,
                projectData: newData.projectData,
                updatedAt: new Date(),
              }
            : old,
        );

        return { previousProject };
      }
    },
    onSuccess: (updatedProject) => {
      setSaveStatus("saved");
      setHasUnsavedChanges(false);
      setIsSaving(false);

      // Update the store with the latest project data
      if (updatedProject) {
        selectProject(updatedProject);
      }

      // Update cache with server response
      if (currentProjectId) {
        trpcUtils.projects.getById.setData(
          { uuid: currentProjectId },
          updatedProject,
        );
      }

      onSave?.(true);
    },
    onError: (error, newData, context) => {
      console.error("Failed to save project:", error);
      setSaveStatus("error");
      setIsSaving(false);

      // Rollback optimistic update
      if (context?.previousProject && currentProjectId) {
        trpcUtils.projects.getById.setData(
          { uuid: currentProjectId },
          context.previousProject,
        );
      }

      onSave?.(false);
    },
    onSettled: () => {
      // Always reset saving state when mutation completes
      setIsSaving(false);
    },
  });

  // Local storage helpers for unauthenticated users
  const saveToLocalStorage = useCallback(
    (nodes: CustomNode[], edges: CustomEdge[]) => {
      const editorData: EditorProjectData = {
        nodes,
        edges,
        metadata: {
          lastSaved: new Date().toISOString(),
          version: "1.0.0",
        },
      };
      localStorage.setItem("editor-draft", JSON.stringify(editorData));
      setSaveStatus("local");
    },
    [],
  );

  const loadFromLocalStorage = useCallback((): EditorProjectData | null => {
    try {
      const draft = localStorage.getItem("editor-draft");
      return draft ? (JSON.parse(draft) as EditorProjectData) : null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }, []);

  // Stable save function that doesn't recreate unnecessarily
  const performSave = useCallback(() => {
    // Prevent multiple simultaneous saves
    if (isSaving || saveQueueRef.current) {
      return;
    }

    saveQueueRef.current = true;
    setIsSaving(true);

    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    if (isAuthenticated && currentProjectId) {
      // Save to database via tRPC
      const editorData: EditorProjectData = {
        nodes: currentNodes,
        edges: currentEdges,
        metadata: {
          lastSaved: new Date().toISOString(),
          version: "1.0.0",
        },
      };

      updateProject.mutate({
        uuid: currentProjectId,
        projectData: editorData,
      });
    } else {
      // Save to localStorage for unauthenticated users
      saveToLocalStorage(currentNodes, currentEdges);
      setIsSaving(false);
    }

    saveQueueRef.current = false;
  }, [
    isAuthenticated,
    currentProjectId,
    updateProject,
    saveToLocalStorage,
    isSaving,
  ]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 1000); // 1 second debounce
  }, [performSave]);

  // Manual save function
  const handleManualSave = useCallback(() => {
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }

    debouncedSave();
  }, [isAuthenticated, onAuthRequired, debouncedSave]);

  // Execute workflow function
  const handleExecuteWorkflow = useCallback(() => {
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      }
      return;
    }

    if (!currentProjectId) {
      setExecutionErrors(["No project selected"]);
      return;
    }

    if (nodes.length === 0) {
      setExecutionErrors(["No nodes to execute"]);
      return;
    }

    // Start execution with SSE
    startExecution.mutate({
      projectId: currentProjectId,
      nodes,
      edges,
    });
  }, [
    isAuthenticated,
    onAuthRequired,
    currentProjectId,
    nodes,
    edges,
    startExecution,
  ]);

  // Cancel execution function
  const handleCancelExecution = useCallback(() => {
    if (currentExecutionId) {
      cancelExecution.mutate({ executionId: currentExecutionId });
    }
  }, [currentExecutionId, cancelExecution]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges],
  );

  // Handle node data changes
  const handleNodeDataChange = useCallback(
    (
      nodeId: string,
      newData:
        | NodeData
        | ModelSelectionNodeData
        | TextInputNodeData
        | TextOutputNodeData,
    ) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: newData } : node,
        ),
      );
      setHasUnsavedChanges(true);
    },
    [setNodes],
  );

  // Keep refs updated with current nodes and edges
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      debouncedSave();
    }
  }, [autoSave, hasUnsavedChanges, debouncedSave]);

  // Handle project data loading
  useEffect(() => {
    if (currentProjectId && isAuthenticated && !isLoadingProject) {
      if (project) {
        // Project loaded successfully - always clear editor first, then populate with data
        setNodes([]); // Clear existing nodes
        setEdges([]); // Clear existing edges

        // Then populate with project data if it exists
        if (project.projectData) {
          const projectData = project.projectData as EditorProjectData;
          if (projectData.nodes && Array.isArray(projectData.nodes)) {
            setNodes(projectData.nodes);
          }
          if (projectData.edges && Array.isArray(projectData.edges)) {
            setEdges(projectData.edges);
          }
        }
        setIsProjectLoaded(true);
      } else {
        // Project not found or failed to load
        console.error("Failed to load project");
        setNodes([]); // Clear editor on error
        setEdges([]);
        setIsProjectLoaded(true);
      }
    } else if (!currentProjectId) {
      // No project selected, mark as loaded
      setIsProjectLoaded(true);
    }
  }, [
    project,
    currentProjectId,
    isAuthenticated,
    isLoadingProject,
    setNodes,
    setEdges,
  ]);

  // Handle project errors (e.g., project deleted, access denied)
  useEffect(() => {
    if (projectError && currentProjectId) {
      console.error("Project error:", projectError);

      // If project not found, clear selection and show error
      if (projectError.data?.code === "NOT_FOUND") {
        clearSelection();
        setSaveStatus("error");
      }
    }
  }, [projectError, currentProjectId, clearSelection]);

  // Load initial data effect for unauthenticated users
  useEffect(() => {
    if (!currentProjectId && !isAuthenticated && isLoaded) {
      // Load from localStorage for unauthenticated users
      const localData = loadFromLocalStorage();
      if (localData) {
        setNodes(localData.nodes);
        setEdges(localData.edges);
        setSaveStatus("local");
      }
      setIsProjectLoaded(true);
    }
  }, [
    currentProjectId,
    isAuthenticated,
    isLoaded,
    loadFromLocalStorage,
    setNodes,
    setEdges,
  ]);

  // Track changes to nodes and edges
  const handleNodesChange = useCallback(
    (changes: NodeChange<CustomNode>[]) => {
      onNodesChange(changes);
      setHasUnsavedChanges(true);
    },
    [onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<CustomEdge>[]) => {
      onEdgesChange(changes);
      setHasUnsavedChanges(true);
    },
    [onEdgesChange],
  );

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      disconnectFromExecutionStream();
    };
  }, [disconnectFromExecutionStream]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "j") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  // Function to create a new node with smart positioning
  const createNode = useCallback(
    (nodeType: string, category: string, label: string) => {
      // Simple center positioning with small random offset to avoid overlapping
      const centerX = 400 + Math.random() * 100 - 50; // Random offset between -50 and 50
      const centerY = 300 + Math.random() * 100 - 50;

      // Generate a unique ID
      const id = `${category}-${nodeType}-${Date.now()}`;

      // Create the new node based on type
      let newNode: CustomNode;

      if (nodeType === "modelSelection") {
        newNode = {
          id,
          type: "modelSelection",
          position: { x: centerX, y: centerY },
          data: { label },
        };
      } else if (nodeType === "text" && category === "input") {
        newNode = {
          id,
          type: "textInput",
          position: { x: centerX, y: centerY },
          data: { label, text: "", width: 300, height: 200 },
        };
      } else if (nodeType === "text" && category === "output") {
        newNode = {
          id,
          type: "textOutput",
          position: { x: centerX, y: centerY },
          data: { label, text: "", width: 300, height: 200 },
        };
      } else {
        newNode = {
          id,
          position: { x: centerX, y: centerY },
          data: { label },
        };
      }

      // Add the new node to the existing nodes
      setNodes((nds) => [...nds, newNode]);
      setCommandOpen(false);
      setHasUnsavedChanges(true);
    },
    [setNodes],
  );

  // Add onDataChange to all nodes
  const nodesWithCallbacks = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDataChange: handleNodeDataChange,
    },
  }));

  // Show loading state while project is being loaded
  if (
    currentProjectId &&
    isAuthenticated &&
    !isProjectLoaded &&
    isLoadingProject
  ) {
    return (
      <div className="absolute top-0 left-0 flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-gray-600">Loading project...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      {/* Authentication Banner for unauthenticated users */}
      {!isAuthenticated && isLoaded && (
        <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 transform">
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm">
            <div className="text-sm text-blue-800">
              Sign in to save your work permanently
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onAuthRequired}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Execute Button and Status */}
      <div className="absolute top-20 right-4 z-50 flex items-center gap-3">
        {executionStatus === "running" ? (
          <Button
            onClick={handleCancelExecution}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        ) : (
          <Button
            onClick={handleExecuteWorkflow}
            disabled={!isAuthenticated || nodes.length === 0}
            variant={executionStatus === "error" ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Execute Workflow
          </Button>
        )}

        {/* Progress indicator */}
        {executionStatus === "running" && executionProgress.total > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <div className="text-sm text-blue-800">
              Progress: {executionProgress.completed}/{executionProgress.total}
            </div>
          </div>
        )}

        {executionStatus === "error" && executionErrors.length > 0 && (
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-red-800">
              <AlertTriangle className="h-4 w-4" />
              Execution Failed
            </div>
            <div className="text-xs text-red-700">
              {executionErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Status Indicator */}
      <div className="absolute bottom-4 left-4 z-50">
        <Badge
          variant={
            saveStatus === "saved"
              ? "default"
              : saveStatus === "saving"
                ? "secondary"
                : saveStatus === "local"
                  ? "outline"
                  : "destructive"
          }
          className="flex items-center gap-1"
        >
          {saveStatus === "saving" && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {saveStatus === "saved" && "✓"}
          {saveStatus === "local" && "💾"}
          {saveStatus === "error" && "⚠️"}
          {saveStatus === "saved" && "Saved"}
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "local" && "Local"}
          {saveStatus === "error" && "Error"}
        </Badge>
      </div>

      <ReactFlow
        ref={reactFlowRef}
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {/* Command Menu */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search for nodes to add..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Input Nodes">
            <CommandItem
              onSelect={() => createNode("text", "input", "Text Input")}
            >
              Text Input
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Model Nodes">
            <CommandItem
              onSelect={() =>
                createNode("modelSelection", "model", "Model Selection")
              }
            >
              Model Selection
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Output Nodes">
            <CommandItem
              onSelect={() => createNode("text", "output", "Text Output")}
            >
              Text Output
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Help indicator */}
      <div className="absolute right-4 bottom-4 rounded-md bg-black/80 px-3 py-2 text-sm text-white">
        Press <kbd className="rounded bg-white/20 px-1">⌘J</kbd> or{" "}
        <kbd className="rounded bg-white/20 px-1">Ctrl+J</kbd> to add nodes
        <br />
        Press <kbd className="rounded bg-white/20 px-1">⌘S</kbd> or{" "}
        <kbd className="rounded bg-white/20 px-1">Ctrl+S</kbd> to save
      </div>
    </div>
  );
}
