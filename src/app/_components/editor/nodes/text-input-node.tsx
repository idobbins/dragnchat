"use client";

import React, { useState, useCallback, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Loader2, MoveDiagonal2 } from "lucide-react";

export interface TextInputNodeData extends Record<string, unknown> {
  text?: string;
  label?: string;
  width?: number;
  height?: number;
  onDataChange?: (id: string, newData: TextInputNodeData) => void;
  executionStatus?: 'idle' | 'running' | 'completed' | 'error';
  executionResult?: string;
  executionError?: string;
}

interface TextInputNodeProps {
  data: TextInputNodeData;
  id: string;
  selected?: boolean;
  dragging?: boolean;
}

export function TextInputNode({ data, id }: TextInputNodeProps) {
  const [text, setText] = useState(data.text ?? "");
  const [dimensions, setDimensions] = useState({
    width: data.width ?? 300,
    height: data.height ?? 200,
  });
  const [isResizingState, setIsResizingState] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const resizeDimensions = useRef(dimensions);
  const executionStatus = data.executionStatus ?? 'idle';

  // Get border color based on execution status
  const getBorderColor = () => {
    switch (executionStatus) {
      case 'running':
        return 'border-blue-500 animate-pulse';
      case 'completed':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Handle text changes
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    // Update node data
    const newData = {
      ...data,
      text: newText,
      width: resizeDimensions.current.width,
      height: resizeDimensions.current.height,
    };
    
    if (data.onDataChange) {
      data.onDataChange(id, newData);
    }
  }, [data, id]);

  // Handle resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    setIsResizingState(true);
    e.preventDefault();
    e.stopPropagation();

    // Disable pointer events on the node to prevent drag conflicts
    if (nodeRef.current) {
      nodeRef.current.style.pointerEvents = 'none';
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
          nodeRef.current.style.pointerEvents = 'auto';
        }
        
        // Update node data with final dimensions
        const newData = {
          ...data,
          text,
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
      className={`bg-white border-2 rounded-lg shadow-sm hover:border-gray-300 transition-colors relative group ${getBorderColor()} ${isResizingState ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}`}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        minWidth: 250,
        minHeight: 150,
        userSelect: isResizingState ? 'none' : 'auto',
      }}
    >
      
      {/* Node Content */}
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-500">Text Input</div>
          {getStatusIcon()}
        </div>
        
        <div className="flex-1 relative">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter your text here..."
            className="w-full h-full resize-none border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
        className="absolute -bottom-1 -right-1 w-5 h-5 cursor-se-resize opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center nodrag"
        onMouseDown={handleResizeMouseDown}
      >
        <MoveDiagonal2 className="w-3 h-3 text-gray-500" />
      </div>
    </div>
  );
}
