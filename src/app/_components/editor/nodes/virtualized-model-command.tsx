"use client";

import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenRouterModel } from "@/server/api/routers/openrouter";
import {
  VirtualizedCommand,
  VirtualizedCommandInput,
  VirtualizedCommandList,
  type VirtualCommandItem,
} from "@/components/ui/virtualized-command";

interface VirtualizedModelCommandProps {
  models: OpenRouterModel[];
  selectedModelId?: string;
  onModelSelect: (model: OpenRouterModel) => void;
  searchPlaceholder?: string;
  height?: number;
}

// Group models by provider for better organization
const groupModelsByProvider = (models: OpenRouterModel[]) => {
  const groups: Record<string, OpenRouterModel[]> = {};

  models.forEach((model) => {
    const provider = model.id.split("/")[0] ?? "Other";
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

// Create virtual items for the command list
const createVirtualItems = (
  groupedModels: Record<string, OpenRouterModel[]>,
  selectedModelId: string | undefined,
  onModelSelect: (model: OpenRouterModel) => void,
): VirtualCommandItem[] => {
  const items: VirtualCommandItem[] = [];

  Object.entries(groupedModels).forEach(([provider, models]) => {
    // Add group header
    items.push({
      type: "group",
      id: `group-${provider}`,
      groupHeading: provider,
    });

    // Add model items
    models.forEach((model) => {
      items.push({
        type: "item",
        id: model.id,
        value: model.name,
        onSelect: () => onModelSelect(model),
        content: (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <Check
                className={cn(
                  "mr-3 h-4 w-4",
                  selectedModelId === model.id ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{model.name}</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {model.context_length.toLocaleString()} ctx
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatPricing(model)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ),
      });
    });
  });

  return items;
};

export const VirtualizedModelCommand = React.memo(
  ({
    models,
    selectedModelId,
    onModelSelect,
    searchPlaceholder = "Search models...",
    height = 400,
  }: VirtualizedModelCommandProps) => {
    const [search, setSearch] = useState("");

    // Pre-compute grouped models
    const groupedModels = useMemo(() => {
      return groupModelsByProvider(models);
    }, [models]);

    // Filter models based on search
    const filteredGroupedModels = useMemo(() => {
      if (!search.trim()) return groupedModels;

      const filtered: Record<string, OpenRouterModel[]> = {};

      Object.entries(groupedModels).forEach(([provider, providerModels]) => {
        const matchingModels = providerModels.filter(
          (model) =>
            model.name.toLowerCase().includes(search.toLowerCase()) ||
            model.id.toLowerCase().includes(search.toLowerCase()),
        );

        if (matchingModels.length > 0) {
          filtered[provider] = matchingModels;
        }
      });

      return filtered;
    }, [groupedModels, search]);

    // Create virtual items for the filtered models
    const virtualItems = useMemo(() => {
      return createVirtualItems(
        filteredGroupedModels,
        selectedModelId,
        onModelSelect,
      );
    }, [filteredGroupedModels, selectedModelId, onModelSelect]);

    return (
      <VirtualizedCommand className="h-full">
        <VirtualizedCommandInput
          placeholder={searchPlaceholder}
          value={search}
          onValueChange={setSearch}
        />
        <VirtualizedCommandList
          items={virtualItems}
          height={height - 60} // Account for input height
          itemHeight={80} // Height for model items
          groupHeaderHeight={40} // Height for group headers
          emptyMessage="No models found."
        />
      </VirtualizedCommand>
    );
  },
);

VirtualizedModelCommand.displayName = "VirtualizedModelCommand";
