import { useCallback } from "react";
import { useEdgesState, type Connection } from "@xyflow/react";
import type { EditorEdge, EditorNode } from "../nodes/types";
import { createEdge, isValidConnection } from "../utils/editor-utils";

export function useEdges(initialEdges: EditorEdge[] = []) {
  const [edges, setEdges, onEdgesChange] = useEdgesState<EditorEdge>(initialEdges);

  /**
   * Handles connecting two nodes
   */
  const onConnect = useCallback(
    (connection: Connection, nodes: EditorNode[]) => {
      if (isValidConnection(connection, nodes)) {
        setEdges((eds) => createEdge(eds, connection));
        return true;
      }
      return false;
    },
    [setEdges]
  );

  /**
   * Removes an edge by ID
   */
  const removeEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  /**
   * Removes all edges connected to a node
   */
  const removeEdgesForNode = useCallback(
    (nodeId: string) => {
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
    },
    [setEdges]
  );

  /**
   * Gets all edges connected to a node
   */
  const getEdgesForNode = useCallback(
    (nodeId: string) => {
      return edges.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );
    },
    [edges]
  );

  /**
   * Updates an edge's properties
   */
  const updateEdge = useCallback(
    (edgeId: string, newProps: Partial<Omit<EditorEdge, "id">>) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            return { ...edge, ...newProps };
          }
          return edge;
        })
      );
    },
    [setEdges]
  );

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    removeEdge,
    removeEdgesForNode,
    getEdgesForNode,
    updateEdge,
  };
}
