"use client";

import React from "react";
import {
  FilePlus,
  ImagePlus,
  SquarePen,
  Trash2,
  Grid,
  Plus,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { EditorNode } from "./nodes/types";

interface EditorToolbarProps {
  onAddTextNode?: () => void;
  onAddImageNode?: () => void;
  onAddFileNode?: () => void;
  onAddModelNode?: () => void;
  onArrangeNodes?: () => void;
  onClearEditor?: () => void;
  onDeleteSelected?: () => void;
  selectedNodes: EditorNode[];
}

export function EditorToolbar({
  onAddTextNode,
  onAddImageNode,
  onAddFileNode,
  onAddModelNode,
  onArrangeNodes,
  onClearEditor,
  onDeleteSelected,
  selectedNodes,
}: EditorToolbarProps) {
  const hasSelectedNodes = selectedNodes.length > 0;

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white p-2 rounded-md shadow-md">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          title="Add Text Input Node"
          onClick={() => onAddTextNode?.()}
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Add Image Input Node"
          onClick={() => onAddImageNode?.()}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Add File Input Node"
          onClick={() => onAddFileNode?.()}
        >
          <FilePlus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Add Model Select Node"
          onClick={() => onAddModelNode?.()}
        >
          <Cpu className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          title="Arrange Nodes in Grid"
          onClick={() => onArrangeNodes?.()}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Delete Selected Nodes"
          onClick={() => onDeleteSelected?.()}
          disabled={!hasSelectedNodes}
          className={!hasSelectedNodes ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          title="Clear Editor"
          onClick={() => onClearEditor?.()}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}
