import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { HandleConfig } from "./types";

interface DynamicHandlesProps {
  inputModalities?: string[];
  outputModalities?: string[];
  className?: string;
}

export function DynamicHandles({ 
  inputModalities = [], 
  outputModalities = [],
  className = ""
}: DynamicHandlesProps) {
  const getModalityColor = (modality: string) => {
    switch (modality.toLowerCase()) {
      case 'text':
        return 'bg-blue-500';
      case 'image':
        return 'bg-green-500';
      case 'audio':
        return 'bg-yellow-500';
      case 'video':
        return 'bg-red-500';
      case 'file':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const generateHandles = (modalities: string[], type: 'source' | 'target'): HandleConfig[] => {
    return modalities.map((modality, index) => ({
      id: `${type}-${modality}-${index}`,
      type,
      position: type === 'target' ? 'left' : 'right',
      dataType: modality,
      label: modality,
      className: `${getModalityColor(modality)} w-3 h-3 border-2 border-white`,
      style: {
        top: `${20 + (index * 25)}px`,
      },
    }));
  };

  const inputHandles = generateHandles(inputModalities, 'target');
  const outputHandles = generateHandles(outputModalities, 'source');

  return (
    <div className={className}>
      {/* Input Handles (Left side) */}
      {inputHandles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type={handle.type}
          position={handle.position as Position}
          className={handle.className}
          style={handle.style}
          title={`Input: ${handle.label}`}
        />
      ))}

      {/* Output Handles (Right side) */}
      {outputHandles.map((handle) => (
        <Handle
          key={handle.id}
          id={handle.id}
          type={handle.type}
          position={handle.position as Position}
          className={handle.className}
          style={handle.style}
          title={`Output: ${handle.label}`}
        />
      ))}

      {/* Default handles if no modalities specified */}
      {inputModalities.length === 0 && (
        <Handle
          id="default-target"
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-500 border-2 border-white"
        />
      )}
      
      {outputModalities.length === 0 && (
        <Handle
          id="default-source"
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-500 border-2 border-white"
        />
      )}
    </div>
  );
}
