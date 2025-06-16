"use client";

import React, { createContext, useContext } from "react";
import type { CustomNodeData } from "../nodes/base/types";

interface NodeUpdateContextType {
  updateNodeData: (nodeId: string, newData: Partial<CustomNodeData>) => void;
}

const NodeUpdateContext = createContext<NodeUpdateContextType | null>(null);

export function NodeUpdateProvider({ 
  children, 
  updateNodeData 
}: { 
  children: React.ReactNode;
  updateNodeData: (nodeId: string, newData: Partial<CustomNodeData>) => void;
}) {
  return (
    <NodeUpdateContext.Provider value={{ updateNodeData }}>
      {children}
    </NodeUpdateContext.Provider>
  );
}

export function useNodeUpdate() {
  const context = useContext(NodeUpdateContext);
  if (!context) {
    throw new Error("useNodeUpdate must be used within a NodeUpdateProvider");
  }
  return context;
}
