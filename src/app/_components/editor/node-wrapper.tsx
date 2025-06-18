"use client";

import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";

interface NodeWrapperProps {
  children: React.ReactNode;
  nodeId: string;
  onDeleteNode: (nodeId: string) => void;
  isExecuting?: boolean;
}

export function NodeWrapper({
  children,
  nodeId,
  onDeleteNode,
  isExecuting = false,
}: NodeWrapperProps) {
  const handleDelete = () => {
    if (!isExecuting) {
      onDeleteNode(nodeId);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          variant="destructive"
          onClick={handleDelete}
          disabled={isExecuting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Node
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
