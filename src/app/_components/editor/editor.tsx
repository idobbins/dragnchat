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
import type { Node, Edge, Connection } from "@xyflow/react";
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

import "@xyflow/react/dist/style.css";

interface NodeData extends Record<string, unknown> {
  label: string;
}

export type CustomNode = Node<NodeData | ModelSelectionNodeData | TextInputNodeData | TextOutputNodeData>;
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
  projectId?: string; // UUID of the project being edited
  initialNodes?: CustomNode[];
  initialEdges?: CustomEdge[];
  onSave?: (success: boolean) => void;
  onAuthRequired?: () => void; // Callback to trigger sign-in
  autoSave?: boolean; // Default true
}

const defaultNodes: CustomNode[] = [];
const defaultEdges: CustomEdge[] = [];

export function Editor({
  projectId,
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onSave,
  onAuthRequired,
  autoSave = true,
}: EditorProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>(initialEdges);
  const [commandOpen, setCommandOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'local'>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authentication state
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;

  // tRPC mutations (only enabled when authenticated)
  const updateProject = api.projects.update.useMutation({
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      onSave?.(true);
    },
    onError: (error) => {
      console.error('Failed to save project:', error);
      setSaveStatus('error');
      onSave?.(false);
    },
  });

  // Local storage helpers for unauthenticated users
  const saveToLocalStorage = useCallback((nodes: CustomNode[], edges: CustomEdge[]) => {
    const editorData: EditorProjectData = {
      nodes,
      edges,
      metadata: {
        lastSaved: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    localStorage.setItem('editor-draft', JSON.stringify(editorData));
    setSaveStatus('local');
  }, []);

  const loadFromLocalStorage = useCallback((): EditorProjectData | null => {
    try {
      const draft = localStorage.getItem('editor-draft');
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((nodes: CustomNode[], edges: CustomEdge[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && projectId) {
        // Save to database via tRPC
        const editorData: EditorProjectData = {
          nodes,
          edges,
          metadata: {
            lastSaved: new Date().toISOString(),
            version: '1.0.0',
          },
        };
        
        updateProject.mutate({
          uuid: projectId,
          projectData: editorData,
        });
      } else {
        // Save to localStorage for unauthenticated users
        saveToLocalStorage(nodes, edges);
      }
    }, 1000); // 1 second debounce
  }, [isAuthenticated, projectId, updateProject, saveToLocalStorage]);

  // Manual save function
  const handleManualSave = useCallback(() => {
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }
    
    debouncedSave(nodes, edges);
  }, [isAuthenticated, onAuthRequired, debouncedSave, nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges],
  );

  // Handle node data changes
  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: NodeData | ModelSelectionNodeData | TextInputNodeData | TextOutputNodeData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: newData } : node
        )
      );
      setHasUnsavedChanges(true);
    },
    [setNodes]
  );

  // Auto-save effect
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      debouncedSave(nodes, edges);
    }
  }, [autoSave, hasUnsavedChanges, nodes, edges, debouncedSave]);

  // Load initial data effect
  useEffect(() => {
    if (!projectId && !isAuthenticated && isLoaded) {
      // Load from localStorage for unauthenticated users
      const localData = loadFromLocalStorage();
      if (localData) {
        setNodes(localData.nodes);
        setEdges(localData.edges);
        setSaveStatus('local');
      }
    }
  }, [projectId, isAuthenticated, isLoaded, loadFromLocalStorage, setNodes, setEdges]);

  // Track changes to nodes and edges
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    setHasUnsavedChanges(true);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    setHasUnsavedChanges(true);
  }, [onEdgesChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      {/* Authentication Banner for unauthenticated users */}
      {!isAuthenticated && isLoaded && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
            <div className="text-sm text-blue-800">
              Sign in to save your work permanently
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onAuthRequired}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Save Status Indicator */}
      <div className="absolute bottom-4 left-4 z-50">
        <Badge
          variant={
            saveStatus === 'saved' ? 'default' :
            saveStatus === 'saving' ? 'secondary' :
            saveStatus === 'local' ? 'outline' : 'destructive'
          }
          className="flex items-center gap-1"
        >
          {saveStatus === 'saving' && (
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
          {saveStatus === 'saved' && '✓'}
          {saveStatus === 'local' && '💾'}
          {saveStatus === 'error' && '⚠️'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'local' && 'Local'}
          {saveStatus === 'error' && 'Error'}
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
            <CommandItem onSelect={() => createNode("modelSelection", "model", "Model Selection")}>
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
