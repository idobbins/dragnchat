"use client";

import React, { useState, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";

export interface TextOutputNodeData extends Record<string, unknown> {
  text?: string;
  label?: string;
  width?: number;
  height?: number;
  onDataChange?: (id: string, newData: TextOutputNodeData) => void;
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const resizeDimensions = useRef(dimensions);

  // Display text from connected input or fallback to data.text
  const displayText = data.text ?? "";

  // Handle resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = resizeDimensions.current.width;
    const startHeight = resizeDimensions.current.height;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const newWidth = Math.max(250, startWidth + (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));

      const newDimensions = { width: newWidth, height: newHeight };
      resizeDimensions.current = newDimensions;
      setDimensions(newDimensions);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        
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
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={nodeRef}
      className="bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors relative group"
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        minWidth: 250,
        minHeight: 150,
      }}
    >
      {/* Input Handle - Left */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      {/* Node Content */}
      <div className="p-3 h-full flex flex-col">
        <div className="text-xs font-medium text-gray-500 mb-2">Text Output</div>
        
        <div className="flex-1 relative">
          <Textarea
            value={displayText}
            readOnly
            placeholder="Text output will appear here..."
            className="w-full h-full resize-none border-gray-200 bg-gray-50 cursor-default"
            style={{ minHeight: 'calc(100% - 0px)' }}
          />
        </div>
      </div>
      
      {/* Output Handle - Right */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
      
      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(-45deg, transparent 30%, #9ca3af 30%, #9ca3af 40%, transparent 40%, transparent 60%, #9ca3af 60%, #9ca3af 70%, transparent 70%)',
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}
