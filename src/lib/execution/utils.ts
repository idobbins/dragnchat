// Utility functions for DAG execution

import type { CustomNode, CustomEdge } from "@/app/_components/editor/editor";
import type { ExecutionGraph, ExecutionNode } from "./types";

/**
 * Parse nodes and edges into an execution graph
 */
export function parseNodesToDAG(
  nodes: CustomNode[],
  edges: CustomEdge[],
): ExecutionGraph {
  const executionNodes = new Map<string, ExecutionNode>();

  // Initialize execution nodes
  for (const node of nodes) {
    executionNodes.set(node.id, {
      id: node.id,
      type: node.type as "textInput" | "modelSelection" | "textOutput",
      data: node.data,
      dependencies: [],
      dependents: [],
      status: "pending",
    });
  }

  // Build dependency relationships
  for (const edge of edges) {
    const sourceNode = executionNodes.get(edge.source);
    const targetNode = executionNodes.get(edge.target);

    if (sourceNode && targetNode) {
      // Target depends on source
      targetNode.dependencies.push(edge.source);
      // Source has target as dependent
      sourceNode.dependents.push(edge.target);
    }
  }

  // Calculate execution order using topological sort
  const executionOrder = topologicalSort(executionNodes);

  return {
    nodes: executionNodes,
    edges: edges.map((edge) => ({ from: edge.source, to: edge.target })),
    executionOrder,
  };
}

/**
 * Perform topological sort to determine execution order
 */
function topologicalSort(nodes: Map<string, ExecutionNode>): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: string[] = [];

  function visit(nodeId: string): void {
    if (visiting.has(nodeId)) {
      throw new Error(`Circular dependency detected involving node: ${nodeId}`);
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);

    const node = nodes.get(nodeId);
    if (node) {
      // Visit all dependencies first
      for (const depId of node.dependencies) {
        visit(depId);
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    result.push(nodeId);
  }

  // Visit all nodes
  for (const nodeId of nodes.keys()) {
    if (!visited.has(nodeId)) {
      visit(nodeId);
    }
  }

  return result;
}

/**
 * Validate the execution graph for common issues
 */
export function validateExecutionGraph(graph: ExecutionGraph): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for cycles (already done in topological sort, but let's be explicit)
  try {
    topologicalSort(graph.nodes);
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Circular dependency detected",
    );
  }

  // Check for disconnected model nodes
  for (const [nodeId, node] of graph.nodes) {
    if (node.type === "modelSelection") {
      if (node.dependencies.length === 0) {
        errors.push(`Model node ${nodeId} has no input connections`);
      }
    }

    if (node.type === "textOutput") {
      if (node.dependencies.length === 0) {
        errors.push(`Output node ${nodeId} has no input connections`);
      }
    }
  }

  // Check for nodes with invalid configurations
  for (const [nodeId, node] of graph.nodes) {
    if (node.type === "modelSelection") {
      if (!node.data.selectedModel) {
        errors.push(`Model node ${nodeId} has no model selected`);
      }
    }

    if (node.type === "textInput") {
      const text = node.data.text;
      if (!text || (typeof text === "string" && text.trim() === "")) {
        errors.push(`Text input node ${nodeId} is empty`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get input data for a node from its dependencies
 */
export function getNodeInputData(
  nodeId: string,
  graph: ExecutionGraph,
): string {
  const node = graph.nodes.get(nodeId);
  if (!node) return "";

  // Collect results from all dependencies
  const inputs: string[] = [];

  for (const depId of node.dependencies) {
    const depNode = graph.nodes.get(depId);
    if (depNode?.result) {
      inputs.push(depNode.result);
    }
  }

  // Join multiple inputs with newlines
  return inputs.join("\n\n");
}

/**
 * Check if a node is ready to execute (all dependencies completed)
 */
export function isNodeReadyToExecute(
  nodeId: string,
  graph: ExecutionGraph,
): boolean {
  const node = graph.nodes.get(nodeId);
  if (!node) return false;

  // Check if all dependencies are completed
  for (const depId of node.dependencies) {
    const depNode = graph.nodes.get(depId);
    if (!depNode || depNode.status !== "completed") {
      return false;
    }
  }

  return true;
}

/**
 * Update node status and result in the graph
 */
export function updateNodeInGraph(
  nodeId: string,
  graph: ExecutionGraph,
  status: ExecutionNode["status"],
  result?: string,
  error?: string,
): void {
  const node = graph.nodes.get(nodeId);
  if (node) {
    node.status = status;
    if (result !== undefined) {
      node.result = result;
    }
    if (error !== undefined) {
      node.error = error;
    }
  }
}
