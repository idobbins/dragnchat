"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import {
  FileInputNode,
  ImageInputNode,
  ModelSelectNode,
  TextInputNode,
} from "./chatnode";
import type { EditorNode, EditorEdge } from "./editor/nodes/types";

const initialNodes: EditorNode[] = [
  {
    id: "1",
    type: "textInputNode",
    position: { x: 100, y: 100 },
    data: {
      input: "Hello, this is the input text",
      output: "This is the generated output",
    },
  },
  {
    id: "2",
    type: "imageInputNode",
    position: { x: 500, y: 300 },
    data: {
      input: "Another chat node",
      output: "With different content",
    },
  },
  {
    id: "3",
    type: "fileInputNode",
    position: { x: 300, y: 500 },
    data: {
      input: "Another chat node",
      output: "With different content",
    },
  },
  {
    id: "4",
    type: "modelSelectNode",
    position: { x: 100, y: 500 },
    data: {
      input: "Another chat node",
      output: "With different content",
    },
  },
];
const initialEdges: EditorEdge[] = [{ id: "e1-2", source: "1", target: "2" }];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Define custom node types - memoized to prevent re-renders
  const nodeTypes = useMemo(
    () => ({
      fileInputNode: FileInputNode,
      imageInputNode: ImageInputNode,
      modelSelectNode: ModelSelectNode,
      textInputNode: TextInputNode,
    }),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="absolute h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        // fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
