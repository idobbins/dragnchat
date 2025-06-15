"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { NODE_TYPE_CONFIG } from "../constants/editor-config";
import type { NodeProps } from "./types";

export function ImageInputNode({ data, isConnectable }: NodeProps) {
  const config = NODE_TYPE_CONFIG.imageInputNode;
  
  return (
    <BaseNode
      data={data}
      title={config.title}
      color={config.color}
      isConnectable={isConnectable}
      showInputHandle={config.showInputHandle}
      showOutputHandle={config.showOutputHandle}
    >
      <Button variant="outline" size="icon" className="size-8 w-full">
        <ImagePlus className="size-5" />
      </Button>
    </BaseNode>
  );
}
