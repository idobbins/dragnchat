"use client";

import React, { useState, useCallback, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useOpenRouterModels } from "@/stores/openrouter-store";
import type { OpenRouterModel } from "@/server/api/routers/openrouter";
import { VirtualizedModelList } from "./virtualized-model-list";

export interface ModelSelectionNodeData extends Record<string, unknown> {
  selectedModel?: OpenRouterModel;
  label?: string;
  onDataChange?: (id: string, newData: ModelSelectionNodeData) => void;
}

interface ModelSelectionNodeProps {
  data: ModelSelectionNodeData;
  id: string;
  selected?: boolean;
  dragging?: boolean;
}

// Format pricing for display
const formatPricing = (model: OpenRouterModel) => {
  const prompt = parseFloat(model.pricing.prompt);
  const completion = parseFloat(model.pricing.completion);
  
  if (prompt === 0 && completion === 0) return "Free";
  
  const promptPrice = (prompt * 1000000).toFixed(2);
  const completionPrice = (completion * 1000000).toFixed(2);
  
  return `$${promptPrice}/$${completionPrice} per 1M tokens`;
};

export function ModelSelectionNode({ data, id }: ModelSelectionNodeProps) {
  const [open, setOpen] = useState(false);
  const { models } = useOpenRouterModels();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleModelSelect = useCallback((model: OpenRouterModel) => {
    // Update node data
    const newData = {
      ...data,
      selectedModel: model,
    };
    
    // Call the callback to update the node data if provided
    if (data.onDataChange) {
      data.onDataChange(id, newData);
    }
    
    setOpen(false);
  }, [data, id]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const selectedModel = data.selectedModel;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm min-w-[200px] hover:border-gray-300 transition-colors">
      {/* Input Handle - Left */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      
      {/* Node Content */}
      <div className="p-3">
        <div className="text-xs font-medium text-gray-500 mb-2">Model Selection</div>
        
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              ref={buttonRef}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between text-left font-normal"
            >
              {selectedModel ? (
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedModel.name}</span>
                  <span className="text-xs text-gray-500">{formatPricing(selectedModel)}</span>
                </div>
              ) : (
                <span className="text-gray-500">Select model...</span>
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-[400px] p-0" align="start">
            {models && models.length > 0 ? (
              <VirtualizedModelList
                models={models}
                selectedModelId={selectedModel?.id}
                onModelSelect={handleModelSelect}
                searchPlaceholder="Search models..."
              />
            ) : (
              <div className="flex items-center justify-center p-8 text-gray-500">
                No models available
              </div>
            )}
          </PopoverContent>
        </Popover>
        
        {selectedModel && (
          <div className="mt-2 text-xs text-gray-500">
            Context: {selectedModel.context_length.toLocaleString()} tokens
          </div>
        )}
      </div>
      
      {/* Output Handle - Right */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
}
