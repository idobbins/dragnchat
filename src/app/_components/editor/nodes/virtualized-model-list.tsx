"use client";

import React, { useMemo, useState, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenRouterModel } from "@/server/api/routers/openrouter";

interface VirtualizedModelListProps {
  models: OpenRouterModel[];
  selectedModelId?: string;
  onModelSelect: (model: OpenRouterModel) => void;
  searchPlaceholder?: string;
}

// Group models by provider for better organization
const groupModelsByProvider = (models: OpenRouterModel[]) => {
  const groups: Record<string, OpenRouterModel[]> = {};
  
  models.forEach((model) => {
    const provider = model.id.split('/')[0] || 'Other';
    if (!groups[provider]) {
      groups[provider] = [];
    }
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

// Create flat list of items for virtualization (headers + models)
interface VirtualItem {
  type: 'header' | 'model';
  provider?: string;
  model?: OpenRouterModel;
  id: string;
}

const createVirtualItems = (groupedModels: Record<string, OpenRouterModel[]>): VirtualItem[] => {
  const items: VirtualItem[] = [];
  
  Object.entries(groupedModels).forEach(([provider, models]) => {
    // Add header
    items.push({
      type: 'header',
      provider,
      id: `header-${provider}`,
    });
    
    // Add models
    models.forEach((model) => {
      items.push({
        type: 'model',
        model,
        id: model.id,
      });
    });
  });
  
  return items;
};

// Memoized model item component
const ModelItem = React.memo(({ 
  model, 
  isSelected, 
  onSelect 
}: { 
  model: OpenRouterModel; 
  isSelected: boolean; 
  onSelect: (model: OpenRouterModel) => void;
}) => (
  <div
    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
    onClick={() => onSelect(model)}
  >
    <div className="flex items-center">
      <Check
        className={cn(
          "mr-3 h-4 w-4",
          isSelected ? "opacity-100 text-blue-600" : "opacity-0"
        )}
      />
      <div className="flex flex-col">
        <span className="font-medium text-sm">{model.name}</span>
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
  </div>
));

ModelItem.displayName = "ModelItem";

// Memoized header component
const HeaderItem = React.memo(({ provider }: { provider: string }) => (
  <div className="bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 sticky top-0 z-10">
    {provider}
  </div>
));

HeaderItem.displayName = "HeaderItem";

// Custom search input with debouncing
const SearchInput = React.memo(({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
}) => {
  const [localValue, setLocalValue] = useState(value || "");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debounced update
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);

  return (
    <div className="relative p-3 border-b border-gray-200">
      <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";

export const VirtualizedModelList = React.memo(({
  models,
  selectedModelId,
  onModelSelect,
  searchPlaceholder = "Search models..."
}: VirtualizedModelListProps) => {
  const [searchValue, setSearchValue] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  // Pre-compute grouped models
  const groupedModels = useMemo(() => {
    return groupModelsByProvider(models);
  }, [models]);

  // Filter models based on search
  const filteredGroupedModels = useMemo(() => {
    if (!searchValue.trim()) return groupedModels;
    
    const filtered: Record<string, OpenRouterModel[]> = {};
    
    Object.entries(groupedModels).forEach(([provider, providerModels]) => {
      const matchingModels = providerModels.filter((model) =>
        model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        model.id.toLowerCase().includes(searchValue.toLowerCase())
      );
      
      if (matchingModels.length > 0) {
        filtered[provider] = matchingModels;
      }
    });
    
    return filtered;
  }, [groupedModels, searchValue]);

  // Create virtual items
  const virtualItems = useMemo(() => {
    return createVirtualItems(filteredGroupedModels);
  }, [filteredGroupedModels]);

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = virtualItems[index];
      return item?.type === 'header' ? 40 : 80; // Headers are smaller
    },
    overscan: 10, // Render extra items for smooth scrolling
  });

  const handleModelSelect = useCallback((model: OpenRouterModel) => {
    onModelSelect(model);
  }, [onModelSelect]);

  if (virtualItems.length === 0) {
    return (
      <div className="w-full">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder={searchPlaceholder}
        />
        <div className="flex items-center justify-center p-8 text-gray-500">
          No models found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] flex flex-col">
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        placeholder={searchPlaceholder}
      />
      
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ height: '360px' }} // Fixed height for virtualization
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = virtualItems[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {item.type === 'header' ? (
                  <HeaderItem provider={item.provider!} />
                ) : (
                  <ModelItem
                    model={item.model!}
                    isSelected={selectedModelId === item.model!.id}
                    onSelect={handleModelSelect}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualizedModelList.displayName = "VirtualizedModelList";
