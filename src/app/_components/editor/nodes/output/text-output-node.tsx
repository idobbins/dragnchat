"use client";

import React from "react";
import { BaseNode } from "../base/base-node";
import { DynamicHandles } from "../base/dynamic-handles";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileText } from "lucide-react";
import type { BaseNodeProps, OutputNodeData } from "../base/types";

export function TextOutputNode({ data, selected, ...props }: BaseNodeProps) {
  const outputData = data as OutputNodeData;
  const textContent = outputData.content as string || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    // In a real implementation, you might show a toast notification
    console.log("Text copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <BaseNode data={data} selected={selected} {...props}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600" />
          <Label className="text-sm font-medium">Text Output</Label>
          <div className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0"
              disabled={!textContent}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-6 w-6 p-0"
              disabled={!textContent}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="min-h-[80px] p-3 bg-muted/50 rounded-md border">
          {textContent ? (
            <div className="text-sm whitespace-pre-wrap break-words">
              {textContent}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No output yet...
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {textContent.length} characters
        </div>

        {/* Input handle for text */}
        <DynamicHandles
          inputModalities={["text"]}
        />
      </div>
    </BaseNode>
  );
}
