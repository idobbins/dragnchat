"use client";

import React, { useCallback } from "react";
import { BaseNode } from "../base/base-node";
import { DynamicHandles } from "../base/dynamic-handles";
import { ModelCombobox } from "./model-combobox";
import type { BaseNodeProps, ModelNodeData } from "../base/types";
import type { OpenRouterModel } from "../services/openrouter";

export function ModelNode({ data, selected, ...props }: BaseNodeProps) {
  const modelData = data as ModelNodeData;

  const handleModelChange = useCallback((modelId: string, model: OpenRouterModel) => {
    // Update node data with selected model information
    const updatedData: ModelNodeData = {
      ...modelData,
      modelId,
      modelName: model.name,
      inputModalities: model.architecture.input_modalities,
      outputModalities: model.architecture.output_modalities,
      parameters: {}, // Initialize empty parameters
    };

    // In a real implementation, you would update the node data in the React Flow state
    // This would typically be done through a callback passed down from the parent component
    console.log("Model selected:", updatedData);
  }, [modelData]);

  return (
    <BaseNode data={data} selected={selected} {...props}>
      <div className="space-y-3">
        <ModelCombobox
          value={modelData.modelId}
          onValueChange={handleModelChange}
          placeholder="Select an AI model..."
        />
        
        {modelData.modelName && (
          <div className="text-xs text-muted-foreground">
            Selected: {modelData.modelName}
          </div>
        )}
        
        {/* Dynamic handles based on selected model */}
        <DynamicHandles
          inputModalities={modelData.inputModalities}
          outputModalities={modelData.outputModalities}
        />
      </div>
    </BaseNode>
  );
}
