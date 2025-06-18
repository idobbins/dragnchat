"use client";

import React, { useState, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Loader2, MoveDiagonal2 } from "lucide-react";
import { NodeWrapper } from "../node-wrapper";

export interface TextOutputNodeData extends Record<string, unknown> {
  text?: string;
  label?: string;
  width?: number;
  height?: number;
  onDataChange?: (id: string, newData: TextOutputNodeData) => void;
  onDeleteNode?: (nodeId: string) => void;
  executionStatus?: "idle" | "running" | "completed" | "error";
  executionResult?: string;
  executionError?: string;
}

interface TextOutputNodeProps {
  data: TextOutputNodeData;
  id: string;
  selected?: boolean;
  dragging?: boolean;
}

export function TextOutputNode({ data, id }: TextOutputNodeProps) {
  const [dimensions, setDimensions] = useState({
    width: data.width ?? 300,
    height: data.height ?? 200,
  });
  const [isResizingState, setIsResizingState] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const resizeDimensions = useRef(dimensions);
  const executionStatus = data.executionStatus ?? "idle";

  // Display text from execution result or fallback to data.text
  const displayText = data.executionResult ?? data.text ?? "";

  // Get border color based on execution status
  const getBorderColor = () => {
    switch (executionStatus) {
      case "running":
        return "border-blue-500 animate-pulse";
      case "completed":
        return "border-green-500";
      case "error":
        return "border-red-500";
      default:
        return "border-border";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (executionStatus) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Handle resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    setIsResizingState(true);
    e.preventDefault();
    e.stopPropagation();

    // Disable pointer events on the node to prevent drag conflicts
    if (nodeRef.current) {
      nodeRef.current.style.pointerEvents = "none";
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = resizeDimensions.current.width;
    const startHeight = resizeDimensions.current.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      e.preventDefault();
      e.stopPropagation();

      const newWidth = Math.max(250, startWidth + (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));

      const newDimensions = { width: newWidth, height: newHeight };
      resizeDimensions.current = newDimensions;
      setDimensions(newDimensions);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        setIsResizingState(false);

        // Re-enable pointer events
        if (nodeRef.current) {
          nodeRef.current.style.pointerEvents = "auto";
        }

        // Update node data with final dimensions
        const newData = {
          ...data,
          width: resizeDimensions.current.width,
          height: resizeDimensions.current.height,
        };

        if (data.onDataChange) {
          data.onDataChange(id, newData);
        }
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <NodeWrapper
      nodeId={id}
      onDeleteNode={data.onDeleteNode ?? (() => { /* no-op */ })}
      isExecuting={executionStatus === "running"}
    >
      <div
        ref={nodeRef}
        className={`group relative rounded-lg border-2 bg-card shadow-sm transition-colors hover:border-muted-foreground/50 ${getBorderColor()} ${isResizingState ? "ring-opacity-50 ring-2 ring-blue-300" : ""}`}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          minWidth: 250,
          minHeight: 150,
          userSelect: isResizingState ? "none" : "auto",
        }}
      >
        {/* Input Handle - Left */}
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-white !bg-blue-500"
        />

        {/* Node Content */}
        <div className="flex h-full flex-col p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">Text Output</div>
            {getStatusIcon()}
          </div>

          <div className="relative flex-1 overflow-hidden">
            <Textarea
              value={displayText}
              readOnly
              placeholder="Text output will appear here..."
              className="h-full w-full cursor-default resize-none overflow-y-auto border-border bg-muted text-foreground"
              style={{
                minHeight: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
        </div>

        {/* Output Handle - Right */}
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-white !bg-green-500"
        />

        {/* Resize Handle */}
        <div
          className="nodrag absolute -right-1 -bottom-1 flex h-5 w-5 cursor-se-resize items-center justify-center opacity-60 transition-opacity hover:opacity-100"
          onMouseDown={handleResizeMouseDown}
        >
          <MoveDiagonal2 className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </NodeWrapper>
  );
}
