"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenRouterModel } from "@/server/api/routers/openrouter";

interface ModelListProps {
  models: OpenRouterModel[] | null;
  isLoading: boolean;
  error: string | null;
  selectedModelId?: string;
  onModelSelect: (model: OpenRouterModel) => void;
  searchPlaceholder?: string;
}

// Group models by provider for better organization
const groupModelsByProvider = (models: OpenRouterModel[]) => {
  const groups: Record<string, OpenRouterModel[]> = {};
  
  models.forEach((model) => {
    const provider = model.id.split('/')[0] ?? 'Other';
    groups[provider] ??= [];
    groups[provider].push(model);
  });
  
  return groups;
};

// Format pricing for display
const formatPricing = (model: OpenRouterModel) => {
  const prompt = parseFloat(model.pricing.prompt);
  const completion = parseFloat(model.pricing.completion);
  
  if (prompt === 0 && completion === 0) return "Free";
  
  const promptPrice = (prompt * 1000000).toFixed(2);
  const completionPrice = (completion * 1000000).toFixed(2);
  
  return `$${promptPrice}/$${completionPrice} per 1M tokens`;
};

// Memoized model item component for better performance
const ModelItem = React.memo(({ 
  model, 
  isSelected, 
  onSelect 
}: { 
  model: OpenRouterModel; 
  isSelected: boolean; 
  onSelect: (model: OpenRouterModel) => void;
}) => (
  <CommandItem
    key={model.id}
    value={model.id}
    onSelect={() => onSelect(model)}
    className="flex items-center justify-between p-2"
  >
    <div className="flex items-center">
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="flex flex-col">
        <span className="font-medium">{model.name}</span>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {model.context_length.toLocaleString()} ctx
          </Badge>
          <span className="text-xs text-gray-500">
            {formatPricing(model)}
          </span>
        </div>
      </div>
    </div>
  </CommandItem>
));

ModelItem.displayName = "ModelItem";

// Memoized model group component
const ModelGroup = React.memo(({ 
  provider, 
  models, 
  selectedModelId, 
  onModelSelect 
}: { 
  provider: string; 
  models: OpenRouterModel[]; 
  selectedModelId?: string; 
  onModelSelect: (model: OpenRouterModel) => void;
}) => (
  <CommandGroup key={provider} heading={provider}>
    {models.map((model) => (
      <ModelItem
        key={model.id}
        model={model}
        isSelected={selectedModelId === model.id}
        onSelect={onModelSelect}
      />
    ))}
  </CommandGroup>
));

ModelGroup.displayName = "ModelGroup";

export const ModelList = React.memo(({
  models,
  isLoading,
  error,
  selectedModelId,
  onModelSelect,
  searchPlaceholder = "Search models..."
}: ModelListProps) => {
  const [searchValue, setSearchValue] = useState("");

  // Memoize the grouped models computation
  const groupedModels = useMemo(() => {
    if (!models) return {};
    return groupModelsByProvider(models);
  }, [models]);

  // Memoize the filtered and grouped models
  const filteredAndGroupedModels = useMemo(() => {
    if (!models || !searchValue.trim()) return groupedModels;
    
    const filtered = models.filter((model) =>
      model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      model.id.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return groupModelsByProvider(filtered);
  }, [models, searchValue, groupedModels]);

  const handleModelSelect = useCallback((model: OpenRouterModel) => {
    onModelSelect(model);
    setSearchValue(""); // Clear search after selection
  }, [onModelSelect]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  return (
    <Command>
      <CommandInput
        placeholder={searchPlaceholder}
        value={searchValue}
        onValueChange={handleSearchChange}
      />
      <CommandList>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Loading models...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-500">Failed to load models</span>
          </div>
        ) : (
          <>
            <CommandEmpty>No models found.</CommandEmpty>
            {Object.entries(filteredAndGroupedModels).map(([provider, providerModels]) => (
              <ModelGroup
                key={provider}
                provider={provider}
                models={providerModels}
                selectedModelId={selectedModelId}
                onModelSelect={handleModelSelect}
              />
            ))}
          </>
        )}
      </CommandList>
    </Command>
  );
});

ModelList.displayName = "ModelList";
