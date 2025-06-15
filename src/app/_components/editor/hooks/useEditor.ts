import { useState, useCallback } from "react";
import type { Connection, OnSelectionChangeParams } from "@xyflow/react";
import { useNodes } from "./useNodes";
import { useEdges } from "./useEdges";
import type { EditorNode, EditorEdge } from "../nodes/types";
import { arrangeNodesInGrid } from "../utils/editor-utils";

export interface UseEditorOptions {
  initialNodes?: EditorNode[];
  initialEdges?: EditorEdge[];
}

export function useEditor({
  initialNodes = [],
  initialEdges = [],
}: UseEditorOptions = {}) {
  // Initialize nodes and edges
  const nodesApi = useNodes(initialNodes);
  const edgesApi = useEdges(initialEdges);

  const { nodes } = nodesApi;
  const { edges } = edgesApi;

  // Handle node selection
  const [selectedNodes, setSelectedNodes] = useState<EditorNode[]>([]);
  
  const onSelectionChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
    setSelectedNodes(nodes as EditorNode[]);
  }, []);

  // Handle connecting nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      return edgesApi.onConnect(connection, nodes);
    },
    [edgesApi, nodes]
  );

  // Delete selected nodes and their edges
  const deleteSelectedNodes = useCallback(() => {
    selectedNodes.forEach((node) => {
      nodesApi.removeNode(node.id);
      edgesApi.removeEdgesForNode(node.id);
    });
  }, [selectedNodes, nodesApi, edgesApi]);

  // Arrange nodes in a grid layout
  const arrangeNodes = useCallback(
    (gridGap = 200) => {
      const arrangedNodes = arrangeNodesInGrid(nodes, gridGap);
      nodesApi.setNodes(arrangedNodes);
    },
    [nodes, nodesApi]
  );

  // Clear the editor
  const clearEditor = useCallback(() => {
    nodesApi.setNodes([]);
    edgesApi.setEdges([]);
  }, [nodesApi, edgesApi]);

  return {
    // State
    selectedNodes,
    
    // Node operations
    ...nodesApi,
    
    // Edge operations
    ...edgesApi,
    
    // Combined operations
    onConnect,
    deleteSelectedNodes,
    arrangeNodes,
    clearEditor,
    
    // Selection handling
    onSelectionChange,
  };
}
