"use client";

import React, { useState, useCallback, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useOpenRouterModels } from "@/stores/openrouter-store";
import type { OpenRouterModel } from "@/server/api/routers/openrouter";
import { VirtualizedModelCommand } from "./virtualized-model-command";
import { NodeWrapper } from "../node-wrapper";

export interface ModelSelectionNodeData extends Record<string, unknown> {
  selectedModel?: OpenRouterModel;
  label?: string;
  onDataChange?: (id: string, newData: ModelSelectionNodeData) => void;
  onDeleteNode?: (nodeId: string) => void;
  executionStatus?: "idle" | "running" | "completed" | "error";
  executionResult?: string;
  executionError?: string;
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

  const handleModelSelect = useCallback(
    (model: OpenRouterModel) => {
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
    },
    [data, id],
  );

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  const selectedModel = data.selectedModel;
  const executionStatus = data.executionStatus ?? "idle";

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

  return (
    <NodeWrapper
      nodeId={id}
      onDeleteNode={data.onDeleteNode ?? (() => { /* no-op */ })}
      isExecuting={executionStatus === "running"}
    >
      <div
        className={`bg-card hover:border-ring min-w-[200px] rounded-lg border-2 shadow-sm transition-colors ${getBorderColor()}`}
      >
        {/* Input Handle - Left */}
        <Handle
          type="target"
          position={Position.Left}
          className="!border-background !h-3 !w-3 !border-2 !bg-blue-500"
        />

        {/* Node Content */}
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-muted-foreground text-xs font-medium">
              Model Selection
            </div>
            {getStatusIcon()}
          </div>

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
                    <span className="text-muted-foreground text-xs">
                      {formatPricing(selectedModel)}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select model...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[400px] p-0" align="start">
              {models && models.length > 0 ? (
                <VirtualizedModelCommand
                  models={models}
                  selectedModelId={selectedModel?.id}
                  onModelSelect={handleModelSelect}
                  searchPlaceholder="Search models..."
                  height={400}
                />
              ) : (
                <div className="text-muted-foreground flex items-center justify-center p-8">
                  No models available
                </div>
              )}
            </PopoverContent>
          </Popover>

          {selectedModel && (
            <div className="text-muted-foreground mt-2 text-xs">
              Context: {selectedModel.context_length.toLocaleString()} tokens
            </div>
          )}
        </div>

        {/* Output Handle - Right */}
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-white !bg-green-500"
        />
      </div>
    </NodeWrapper>
  );
}
