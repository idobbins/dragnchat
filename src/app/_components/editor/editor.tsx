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
import { ModelSelectionNode } from "./nodes/model-selection-node";
import type { ModelSelectionNodeData } from "./nodes/model-selection-node";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";

import "@xyflow/react/dist/style.css";

interface NodeData extends Record<string, unknown> {
  label: string;
}

type CustomNode = Node<NodeData | ModelSelectionNodeData>;
type CustomEdge = Edge;

// Define node types for React Flow
const nodeTypes = {
  modelSelection: ModelSelectionNode,
};

interface EditorProps {
  initialNodes?: CustomNode[];
  initialEdges?: CustomEdge[];
}

const defaultNodes: CustomNode[] = [];
const defaultEdges: CustomEdge[] = [];

export function Editor({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
}: EditorProps): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [commandOpen, setCommandOpen] = useState(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Handle node data changes
  const handleNodeDataChange = useCallback(
    (nodeId: string, newData: NodeData | ModelSelectionNodeData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: newData } : node
        )
      );
    },
    [setNodes]
  );

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "j") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <ReactFlow
        ref={reactFlowRef}
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
            <CommandItem
              onSelect={() => createNode("file", "input", "File Input")}
            >
              File Input
            </CommandItem>
            <CommandItem
              onSelect={() => createNode("image", "input", "Image Input")}
            >
              Image Input
            </CommandItem>
            <CommandItem
              onSelect={() => createNode("url", "input", "URL Input")}
            >
              URL Input
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Model Nodes">
            <CommandItem onSelect={() => createNode("modelSelection", "model", "Model Selection")}>
              Model Selection
            </CommandItem>
            <CommandItem onSelect={() => createNode("model", "model", "Model")}>
              Model (Generic)
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Output Nodes">
            <CommandItem
              onSelect={() => createNode("text", "output", "Text Output")}
            >
              Text Output
            </CommandItem>
            <CommandItem
              onSelect={() => createNode("image", "output", "Image Output")}
            >
              Image Output
            </CommandItem>
            <CommandItem
              onSelect={() => createNode("file", "output", "File Output")}
            >
              File Output
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Operator Nodes">
            <CommandItem
              onSelect={() => createNode("merge", "operator", "Merge")}
            >
              Merge
            </CommandItem>
            <CommandItem
              onSelect={() => createNode("diff", "operator", "Diff")}
            >
              Diff
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Help indicator */}
      <div className="absolute right-4 bottom-4 rounded-md bg-black/80 px-3 py-2 text-sm text-white">
        Press <kbd className="rounded bg-white/20 px-1">⌘J</kbd> or{" "}
        <kbd className="rounded bg-white/20 px-1">Ctrl+J</kbd> to add nodes
      </div>
    </div>
  );
}
