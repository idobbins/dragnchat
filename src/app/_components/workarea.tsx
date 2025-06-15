"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import type { EditorNode, EditorEdge } from "./editor/nodes/types";
import {
  FileInputNode,
  ImageInputNode,
  ModelSelectNode,
  TextInputNode,
} from "./editor/nodes";
import { useEditor } from "./editor/hooks";
import { ErrorBoundary } from "./editor/ErrorBoundary";
import { LoadingState } from "./editor/LoadingState";
import { EditorToolbar } from "./editor/EditorToolbar";

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

export default function WorkArea() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    nodes,
    edges,
    selectedNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    addTextInputNode,
    addImageInputNode,
    addFileInputNode,
    addModelSelectNode,
    deleteSelectedNodes,
    arrangeNodes,
    clearEditor,
  } = useEditor({
    initialNodes,
    initialEdges,
  });

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
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handler functions for toolbar actions
  const handleAddTextNode = useCallback(() => {
    if (addTextInputNode) {
      addTextInputNode({ x: 100, y: 100 }, "New text input");
    }
  }, [addTextInputNode]);
  
  const handleAddImageNode = useCallback(() => {
    if (addImageInputNode) {
      addImageInputNode({ x: 200, y: 100 });
    }
  }, [addImageInputNode]);
  
  const handleAddFileNode = useCallback(() => {
    if (addFileInputNode) {
      addFileInputNode({ x: 300, y: 100 });
    }
  }, [addFileInputNode]);
  
  const handleAddModelNode = useCallback(() => {
    if (addModelSelectNode) {
      addModelSelectNode({ x: 400, y: 100 });
    }
  }, [addModelSelectNode]);
  
  const handleArrangeNodes = useCallback(() => {
    if (arrangeNodes) {
      arrangeNodes(200);
    }
  }, [arrangeNodes]);

  return (
    <div className="absolute h-screen w-screen">
      <ErrorBoundary>
        {isLoading ? (
          <LoadingState message="Initializing editor..." />
        ) : (
          <>
            <EditorToolbar
              onAddTextNode={handleAddTextNode}
              onAddImageNode={handleAddImageNode}
              onAddFileNode={handleAddFileNode}
              onAddModelNode={handleAddModelNode}
              onArrangeNodes={handleArrangeNodes}
              onClearEditor={() => clearEditor?.()}
              onDeleteSelected={() => deleteSelectedNodes?.()}
              selectedNodes={selectedNodes ?? []}
            />
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              // fitView
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}
