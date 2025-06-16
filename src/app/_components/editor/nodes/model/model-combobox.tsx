"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/trpc/react";
import { formatPrice, getModelCapabilities } from "../services/openrouter";
import type { OpenRouterModel } from "../services/openrouter";

interface ModelComboboxProps {
  value?: string;
  onValueChange: (value: string, model: OpenRouterModel) => void;
  placeholder?: string;
  className?: string;
}

export function ModelCombobox({
  value,
  onValueChange,
  placeholder = "Select a model...",
  className = "",
}: ModelComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: modelsData, isLoading, error } = api.openrouter.getModels.useQuery();

  const models = modelsData?.models || [];
  const selectedModel = models.find((model) => model.id === value);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    model.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    model.id.toLowerCase().includes(searchValue.toLowerCase())
  );

  const groupedModels = filteredModels.reduce((acc, model) => {
    const provider = model.id.split('/')[0] || 'Other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, OpenRouterModel[]>);

  const handleSelect = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (model) {
      onValueChange(modelId, model);
    }
    setOpen(false);
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-destructive bg-destructive/10 rounded-md">
        <AlertCircle className="h-4 w-4" />
        {error.message}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading models...
            </div>
          ) : selectedModel ? (
            <div className="flex items-center gap-2 truncate">
              <span className="truncate">{selectedModel.name}</span>
              <Badge variant="secondary" className="text-xs">
                {formatPrice(selectedModel.pricing.prompt)}
              </Badge>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search models..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <CommandGroup key={provider} heading={provider}>
                {providerModels.map((model) => {
                  const capabilities = getModelCapabilities(model);
                  return (
                    <CommandItem
                      key={model.id}
                      value={model.id}
                      onSelect={handleSelect}
                      className="flex flex-col items-start gap-2 p-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Check
                            className={`h-4 w-4 ${
                              value === model.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <span className="font-medium truncate">{model.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {formatPrice(model.pricing.prompt)}
                        </Badge>
                      </div>
                      
                      {model.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 ml-6">
                          {model.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 ml-6">
                        {model.architecture.input_modalities.map((modality) => (
                          <Badge key={`input-${modality}`} variant="outline" className="text-xs">
                            {modality}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground">→</span>
                        {model.architecture.output_modalities.map((modality) => (
                          <Badge key={`output-${modality}`} variant="outline" className="text-xs">
                            {modality}
                          </Badge>
                        ))}
                        {capabilities.length > 0 && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            {capabilities.map((capability) => (
                              <Badge key={capability} variant="secondary" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </>
                        )}
                      </div>
                      
                      {model.context_length > 0 && (
                        <div className="text-xs text-muted-foreground ml-6">
                          Context: {model.context_length.toLocaleString()} tokens
                        </div>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
