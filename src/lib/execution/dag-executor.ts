// Main DAG execution engine

import type { CustomNode, CustomEdge } from "@/app/_components/editor/editor";
import type {
  ExecutionGraph,
  ExecutionContext,
  ExecutionProgress,
  ExecutionProgressCallback,
  NodeExecutionResult,
} from "./types";
import {
  parseNodesToDAG,
  validateExecutionGraph,
  getNodeInputData,
  isNodeReadyToExecute,
  updateNodeInGraph,
} from "./utils";
import { executeOpenRouterModel } from "./openrouter-executor";

export class DAGExecutor {
  private graph: ExecutionGraph;
  private context: ExecutionContext;
  private progressCallback?: ExecutionProgressCallback;
  private isExecuting = false;

  constructor(
    nodes: CustomNode[],
    edges: CustomEdge[],
    context: ExecutionContext,
    progressCallback?: ExecutionProgressCallback
  ) {
    this.graph = parseNodesToDAG(nodes, edges);
    this.context = context;
    this.progressCallback = progressCallback;
  }

  /**
   * Execute the entire workflow
   */
  async execute(): Promise<{ success: boolean; errors: string[] }> {
    if (this.isExecuting) {
      return { success: false, errors: ["Execution already in progress"] };
    }

    this.isExecuting = true;

    try {
      // Validate the graph first
      const validation = validateExecutionGraph(this.graph);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      // Execute nodes in topological order
      for (const nodeId of this.graph.executionOrder) {
        const result = await this.executeNode(nodeId);
        if (!result.success) {
          return { success: false, errors: [result.error || "Unknown execution error"] };
        }
      }

      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown execution error"],
      };
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(nodeId: string): Promise<NodeExecutionResult> {
    const node = this.graph.nodes.get(nodeId);
    if (!node) {
      return {
        success: false,
        error: `Node ${nodeId} not found`,
        timestamp: new Date().toISOString(),
      };
    }

    // Check if node is ready to execute
    if (!isNodeReadyToExecute(nodeId, this.graph)) {
      return {
        success: false,
        error: `Node ${nodeId} dependencies not ready`,
        timestamp: new Date().toISOString(),
      };
    }

    // Update status to running
    updateNodeInGraph(nodeId, this.graph, "running");
    this.notifyProgress({
      nodeId,
      status: "running",
      timestamp: new Date().toISOString(),
    });

    try {
      let result: any;

      switch (node.type) {
        case "textInput":
          result = await this.executeTextInputNode(nodeId);
          break;
        case "modelSelection":
          result = await this.executeModelSelectionNode(nodeId);
          break;
        case "textOutput":
          result = await this.executeTextOutputNode(nodeId);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      // Update node with result
      updateNodeInGraph(nodeId, this.graph, "completed", result);
      this.notifyProgress({
        nodeId,
        status: "completed",
        result,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Update node with error
      updateNodeInGraph(nodeId, this.graph, "error", undefined, errorMessage);
      this.notifyProgress({
        nodeId,
        status: "error",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Execute a text input node
   */
  private async executeTextInputNode(nodeId: string): Promise<string> {
    const node = this.graph.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    const text = node.data.text || "";
    if (text.trim() === "") {
      throw new Error("Text input is empty");
    }

    return text;
  }

  /**
   * Execute a model selection node
   */
  private async executeModelSelectionNode(nodeId: string): Promise<string> {
    const node = this.graph.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    const selectedModel = node.data.selectedModel;
    if (!selectedModel) {
      throw new Error("No model selected");
    }

    // Get input data from dependencies
    const inputText = getNodeInputData(nodeId, this.graph);
    if (!inputText.trim()) {
      throw new Error("No input text provided to model");
    }

    // Execute the model via OpenRouter
    const response = await executeOpenRouterModel({
      model: selectedModel,
      inputText,
      apiKey: this.context.apiKey,
    });

    if (!response.success) {
      throw new Error(response.error || "Model execution failed");
    }

    return response.result || "";
  }

  /**
   * Execute a text output node
   */
  private async executeTextOutputNode(nodeId: string): Promise<string> {
    const node = this.graph.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    // Get input data from dependencies
    const inputText = getNodeInputData(nodeId, this.graph);
    return inputText;
  }

  /**
   * Notify progress callback if provided
   */
  private notifyProgress(progress: ExecutionProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Get the current execution graph
   */
  getGraph(): ExecutionGraph {
    return this.graph;
  }

  /**
   * Check if execution is in progress
   */
  isExecutionInProgress(): boolean {
    return this.isExecuting;
  }

  /**
   * Get execution results for all nodes
   */
  getExecutionResults(): Record<string, { status: string; result?: any; error?: string }> {
    const results: Record<string, { status: string; result?: any; error?: string }> = {};
    
    for (const [nodeId, node] of this.graph.nodes) {
      results[nodeId] = {
        status: node.status,
        result: node.result,
        error: node.error,
      };
    }
    
    return results;
  }
}
