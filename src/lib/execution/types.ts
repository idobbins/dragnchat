// Execution type definitions for the DAG execution engine

export interface ExecutionNodeData extends Record<string, unknown> {
  label: string;
  executionStatus?: "idle" | "running" | "completed" | "error";
  executionResult?: string;
  executionError?: string;
  executionTimestamp?: string;
}

export interface ExecutionNode {
  id: string;
  type: "textInput" | "modelSelection" | "textOutput";
  data: Record<string, unknown>;
  dependencies: string[]; // Node IDs this depends on
  dependents: string[]; // Node IDs that depend on this
  status: "pending" | "running" | "completed" | "error";
  result?: string;
  error?: string;
}

export interface ExecutionGraph {
  nodes: Map<string, ExecutionNode>;
  edges: Array<{ from: string; to: string }>;
  executionOrder: string[];
}

export interface ExecutionContext {
  projectId: string;
  userId: string;
  apiKey: string;
}

export interface NodeExecutionResult {
  success: boolean;
  result?: string;
  error?: string;
  timestamp: string;
}

export interface ExecutionProgress {
  nodeId: string;
  status: "pending" | "running" | "completed" | "error";
  result?: string;
  error?: string;
  timestamp: string;
}

export type ExecutionProgressCallback = (progress: ExecutionProgress) => void;

// Model execution parameters
export interface ModelExecutionParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export const DEFAULT_MODEL_PARAMS: ModelExecutionParams = {
  temperature: 0.7,
  maxTokens: 1000,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
};
