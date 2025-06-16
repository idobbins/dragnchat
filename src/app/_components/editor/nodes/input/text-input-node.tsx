"use client";

import React, { useState, useCallback } from "react";
import { BaseNode } from "../base/base-node";
import { DynamicHandles } from "../base/dynamic-handles";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Type, FileText } from "lucide-react";
import type { BaseNodeProps, InputNodeData } from "../base/types";

export function TextInputNode({ data, selected, ...props }: BaseNodeProps) {
  const inputData = data as InputNodeData;
  const [textValue, setTextValue] = useState(inputData.value as string || "");
  const [isMultiline, setIsMultiline] = useState(false);

  const handleTextChange = useCallback((value: string) => {
    setTextValue(value);
    // In a real implementation, you would update the node data
    console.log("Text input changed:", value);
  }, []);

  return (
    <BaseNode data={data} selected={selected} {...props}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-blue-600" />
          <Label className="text-sm font-medium">Text Input</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMultiline(!isMultiline)}
            className="ml-auto h-6 w-6 p-0"
          >
            <FileText className="h-3 w-3" />
          </Button>
        </div>

        {isMultiline ? (
          <Textarea
            value={textValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTextChange(e.target.value)}
            placeholder="Enter your text here..."
            className="min-h-[80px] resize-none"
            rows={3}
          />
        ) : (
          <Input
            value={textValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange(e.target.value)}
            placeholder="Enter text..."
            className="w-full"
          />
        )}

        <div className="text-xs text-muted-foreground">
          {textValue.length} characters
        </div>

        {/* Output handle for text */}
        <DynamicHandles
          outputModalities={["text"]}
        />
      </div>
    </BaseNode>
  );
}
