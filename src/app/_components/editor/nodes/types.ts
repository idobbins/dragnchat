export interface NodeData extends Record<string, unknown> {
  input?: string
  output?: string
}

export type NodeType = 'textInputNode' | 'imageInputNode' | 'fileInputNode' | 'modelSelectNode'

export interface EditorNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
}

export interface EditorEdge {
  id: string
  source: string
  target: string
}

export interface EditorState {
  nodes: EditorNode[]
  edges: EditorEdge[]
}

// Node component props interface
export interface NodeProps {
  data: NodeData
  isConnectable?: boolean
}
