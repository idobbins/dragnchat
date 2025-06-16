import type { Node, NodeProps } from "@xyflow/react";

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  category: 'input' | 'model' | 'output' | 'operator';
}

export interface InputNodeData extends BaseNodeData {
  category: 'input';
  value?: string | File | File[];
  format?: string;
}

export interface ModelNodeData extends BaseNodeData {
  category: 'model';
  modelId?: string;
  modelName?: string;
  parameters?: Record<string, any>;
  inputModalities?: string[];
  outputModalities?: string[];
}

export interface OutputNodeData extends BaseNodeData {
  category: 'output';
  content?: string | Blob;
  format?: string;
}

export interface OperatorNodeData extends BaseNodeData {
  category: 'operator';
  operation?: string;
  config?: Record<string, any>;
}

export type CustomNodeData = InputNodeData | ModelNodeData | OutputNodeData | OperatorNodeData;

export type CustomNode = Node<CustomNodeData>;

export interface BaseNodeProps extends NodeProps {
  data: CustomNodeData;
  children?: React.ReactNode;
}

export interface HandleConfig {
  id: string;
  type: 'source' | 'target';
  position: 'top' | 'right' | 'bottom' | 'left';
  style?: React.CSSProperties;
  className?: string;
  label?: string;
  dataType?: string;
}
