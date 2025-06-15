"use client";

import React from "react";
import type { ReactNode } from "react";
import { Handle, Position, type NodeProps as ReactFlowNodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import type { NodeData } from "./types";
import { HANDLE_CONFIG } from "../constants/editor-config";

// Base node props extending ReactFlow's NodeProps with our typed data
export interface BaseNodeProps {
  data: NodeData;
  title: string;
  color: string;
  children: ReactNode;
  isConnectable?: boolean;
  showInputHandle?: boolean;
  showOutputHandle?: boolean;
}

export function BaseNode({
  data,
  title,
  color,
  children,
  isConnectable,
  showInputHandle = false,
  showOutputHandle = true,
}: BaseNodeProps) {
  return (
    <>
      {/* Target handle for input connections */}
      {showInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className={`!h-${HANDLE_CONFIG.size} !w-${HANDLE_CONFIG.size} translate-y-0 transform border-${HANDLE_CONFIG.borderWidth} !border-${HANDLE_CONFIG.borderColor} !bg-${color}-500`}
        />
      )}

      <Card className="w-32 overflow-hidden p-0 shadow-lg">
        <CardContent className="flex h-full flex-col p-0">
          <div className={`flex w-full flex-1 bg-${color}-500 px-2 py-1 text-xs font-semibold text-white`}>
            {title}
          </div>
          <div className="p-2">
            {children}
          </div>
        </CardContent>
      </Card>

      {/* Source handle for output connections */}
      {showOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className={`!h-${HANDLE_CONFIG.size} !w-${HANDLE_CONFIG.size} translate-y-0 transform border-${HANDLE_CONFIG.borderWidth} !border-${HANDLE_CONFIG.borderColor} !bg-${color}-500`}
        />
      )}
    </>
  );
}
