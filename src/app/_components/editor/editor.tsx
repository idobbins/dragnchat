import React, { useCallback, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import type { Node, Edge, Connection } from "@xyflow/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import "@xyflow/react/dist/style.css";

interface NodeData extends Record<string, unknown> {
  label: string;
}

type CustomNode = Node<NodeData>;
type CustomEdge = Edge;

const initialNodes: CustomNode[] = [
  { id: "1", position: { x: 100, y: 100 }, data: { label: "1" } },
  { id: "2", position: { x: 100, y: 200 }, data: { label: "2" } },
];
const initialEdges: CustomEdge[] = [{ id: "e1-2", source: "1", target: "2" }];

export function Editor(): React.ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const reactFlowRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Function to create a new node at the position of the right-click
  const createNode = useCallback(
    (type: string, category: string, label: string) => {
      // Use the stored context menu position
      const { x, y } = contextMenuPosition;

      // Generate a unique ID
      const id = `${category}-${type}-${Date.now()}`;

      // Create the new node
      const newNode: CustomNode = {
        id,
        position: { x, y },
        data: { label: `${label}` },
      };

      // Add the new node to the existing nodes
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, contextMenuPosition],
  );

  return (
    <div className="absolute top-0 left-0 h-screen w-screen">
      <ContextMenu>
        <ContextMenuTrigger
          onContextMenu={(e) => {
            // Store the position where the context menu was triggered
            const bounds = e.currentTarget.getBoundingClientRect();
            const flowWrapper = reactFlowRef.current?.getBoundingClientRect();
            
            // Calculate position relative to the flow container
            // This is a simplified version without the transform calculations that ReactFlow does internally
            // For a more accurate position, we'd need to account for zoom and pan, but this works for basic positioning
            const x = e.clientX - (flowWrapper?.left ?? 0);
            const y = e.clientY - (flowWrapper?.top ?? 0);
            
            setContextMenuPosition({ x, y });
          }}
        >
          <ReactFlow
            ref={reactFlowRef}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          {/* Input Nodes Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>Input Nodes</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => createNode("text", "input", "Text Input")}
              >
                Text Input
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("file", "input", "File Input")}
              >
                File Input
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("image", "input", "Image Input")}
              >
                Image Input
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("url", "input", "URL Input")}
              >
                URL Input
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Model Nodes Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>Model Nodes</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => createNode("gpt4", "model", "GPT-4")}
              >
                GPT-4
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  createNode("gpt35turbo", "model", "GPT-3.5 Turbo")
                }
              >
                GPT-3.5 Turbo
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  createNode("claude3opus", "model", "Claude-3 Opus")
                }
              >
                Claude-3 Opus
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  createNode("claude3sonnet", "model", "Claude-3 Sonnet")
                }
              >
                Claude-3 Sonnet
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("llama2", "model", "Llama-2-70b")}
              >
                Llama-2-70b
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("mistral", "model", "Mistral-7B")}
              >
                Mistral-7B
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Output Nodes Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>Output Nodes</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => createNode("text", "output", "Text Output")}
              >
                Text Output
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("image", "output", "Image Output")}
              >
                Image Output
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("file", "output", "File Output")}
              >
                File Output
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          {/* Operator Nodes Submenu */}
          <ContextMenuSub>
            <ContextMenuSubTrigger>Operator Nodes</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => createNode("merge", "operator", "Merge")}
              >
                Merge
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => createNode("diff", "operator", "Diff")}
              >
                Diff
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
