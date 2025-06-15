import { useCallback } from "react";
import { useNodesState, type Node } from "@xyflow/react";
import type { EditorNode } from "../nodes/types";
import {
  createTextInputNode,
  createImageInputNode,
  createFileInputNode,
  createModelSelectNode,
} from "../utils/node-factory";
import { updateNodeData, findNodeById } from "../utils/editor-utils";

export function useNodes(initialNodes: EditorNode[] = []) {
  const [nodes, setNodes, onNodesChange] = useNodesState<EditorNode>(initialNodes);

  /**
   * Adds a new text input node
   */
  const addTextInputNode = useCallback(
    (position: { x: number; y: number }, initialText = "") => {
      const newNode = createTextInputNode(position, initialText);
      setNodes((nds) => [...nds, newNode]);
      return newNode;
    },
    [setNodes]
  );

  /**
   * Adds a new image input node
   */
  const addImageInputNode = useCallback(
    (position: { x: number; y: number }) => {
      const newNode = createImageInputNode(position);
      setNodes((nds) => [...nds, newNode]);
      return newNode;
    },
    [setNodes]
  );

  /**
   * Adds a new file input node
   */
  const addFileInputNode = useCallback(
    (position: { x: number; y: number }) => {
      const newNode = createFileInputNode(position);
      setNodes((nds) => [...nds, newNode]);
      return newNode;
    },
    [setNodes]
  );

  /**
   * Adds a new model select node
   */
  const addModelSelectNode = useCallback(
    (position: { x: number; y: number }) => {
      const newNode = createModelSelectNode(position);
      setNodes((nds) => [...nds, newNode]);
      return newNode;
    },
    [setNodes]
  );

  /**
   * Removes a node by ID
   */
  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    },
    [setNodes]
  );

  /**
   * Updates a node's data
   */
  const updateNode = useCallback(
    (nodeId: string, newData: Partial<EditorNode["data"]>) => {
      setNodes((nds) => updateNodeData(nds, nodeId, newData));
    },
    [setNodes]
  );

  /**
   * Gets a node by ID
   */
  const getNode = useCallback(
    (nodeId: string) => {
      return findNodeById(nodes, nodeId);
    },
    [nodes]
  );

  return {
    nodes,
    setNodes,
    onNodesChange,
    addTextInputNode,
    addImageInputNode,
    addFileInputNode,
    addModelSelectNode,
    removeNode,
    updateNode,
    getNode,
  };
}
