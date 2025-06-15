import { type Connection, type Edge, type Node, addEdge } from "@xyflow/react";
import type { EditorNode, EditorEdge } from "../nodes/types";

/**
 * Adds an edge between two nodes
 */
export function createEdge(
  edges: EditorEdge[],
  connection: Connection
): EditorEdge[] {
  return addEdge(
    {
      ...connection,
      id: `edge_${connection.source}_${connection.target}`,
    },
    edges as Edge[]
  ) as EditorEdge[];
}

/**
 * Checks if a connection is valid
 */
export function isValidConnection(
  connection: Connection,
  nodes: EditorNode[]
): boolean {
  // Prevent connecting a node to itself
  if (connection.source === connection.target) {
    return false;
  }

  // Prevent duplicate connections
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  // Ensure both nodes exist
  if (!sourceNode || !targetNode) {
    return false;
  }

  // Add more validation rules as needed
  // For example, prevent cycles, validate node types compatibility, etc.

  return true;
}

/**
 * Arranges nodes in a grid layout
 */
export function arrangeNodesInGrid(
  nodes: EditorNode[],
  gridGap = 200
): EditorNode[] {
  const columns = Math.ceil(Math.sqrt(nodes.length));
  
  return nodes.map((node, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    
    return {
      ...node,
      position: {
        x: column * gridGap,
        y: row * gridGap,
      },
    };
  });
}

/**
 * Centers the view on a specific node
 */
export function getNodeCenter(node: EditorNode): { x: number; y: number } {
  return {
    x: node.position.x + 64, // Half of node width
    y: node.position.y + 40, // Half of node height (approximate)
  };
}

/**
 * Finds a node by its ID
 */
export function findNodeById(nodes: EditorNode[], id: string): EditorNode | undefined {
  return nodes.find((node) => node.id === id);
}

/**
 * Updates a node's data
 */
export function updateNodeData(
  nodes: EditorNode[],
  nodeId: string,
  newData: Partial<EditorNode["data"]>
): EditorNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          ...newData,
        },
      };
    }
    return node;
  });
}
