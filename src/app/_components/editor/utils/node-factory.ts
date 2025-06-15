import type { EditorNode, NodeData, NodeType } from "../nodes/types";

// Counter for generating unique node IDs
let nodeIdCounter = 0;

/**
 * Generates a unique node ID
 */
export function generateNodeId(): string {
  return `node_${Date.now()}_${nodeIdCounter++}`;
}

/**
 * Creates a new node with the specified type and data
 */
export function createNode(
  type: NodeType,
  position: { x: number; y: number },
  data: NodeData
): EditorNode {
  return {
    id: generateNodeId(),
    type,
    position,
    data,
  };
}

/**
 * Creates a text input node
 */
export function createTextInputNode(
  position: { x: number; y: number },
  initialText = ""
): EditorNode {
  return createNode("textInputNode", position, {
    input: initialText,
    output: "",
  });
}

/**
 * Creates an image input node
 */
export function createImageInputNode(
  position: { x: number; y: number }
): EditorNode {
  return createNode("imageInputNode", position, {
    input: "",
    output: "",
  });
}

/**
 * Creates a file input node
 */
export function createFileInputNode(
  position: { x: number; y: number }
): EditorNode {
  return createNode("fileInputNode", position, {
    input: "",
    output: "",
  });
}

/**
 * Creates a model select node
 */
export function createModelSelectNode(
  position: { x: number; y: number }
): EditorNode {
  return createNode("modelSelectNode", position, {
    input: "",
    output: "",
  });
}
