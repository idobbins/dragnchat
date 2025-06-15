"use client";

import React from "react";
import { Handle, Position, type NodeProps as ReactFlowNodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, ImagePlus, SquarePen } from "lucide-react";
import type { NodeData } from "./editor/nodes/types";

// Extend ReactFlow's NodeProps with our typed data
interface TypedNodeProps extends Omit<ReactFlowNodeProps, 'data'> {
  data: NodeData;
}

export function FileInputNode({ data, isConnectable }: TypedNodeProps) {

  return (
    <>
      {/* Target handle for input connections */}

      <Card className="w-32 overflow-hidden p-0 shadow-lg">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex w-full flex-1 bg-green-500 px-2 py-1 text-xs font-semibold text-white">
            File Input
          </div>
          <div className="p-2">
            <Button variant="outline" size="icon" className="size-8 w-full">
              <FilePlus className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Source handle for output connections */}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!h-2 !w-2 translate-y-0 transform border-2 !border-gray-200 !bg-green-500"
      />
      {/* <Handle
				type="source"
				position={Position.Right}
				isConnectable={isConnectable}
				className="!w-2 !h-2 !bg-green-500 border-2 !border-gray-200 transform translate-y-3"
			/> */}
    </>
  );
}

export function ImageInputNode({ data, isConnectable }: TypedNodeProps) {

  return (
    <>
      {/* Target handle for input connections */}

      <Card className="w-32 overflow-hidden p-0 shadow-lg">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex w-full flex-1 bg-red-500 px-2 py-1 text-xs font-semibold text-white">
            Image Input
          </div>
          <div className="p-2">
            <Button variant="outline" size="icon" className="size-8 w-full">
              <ImagePlus className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Source handle for output connections */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!h-2 !w-2 translate-y-0 transform border-2 !border-gray-200 !bg-red-500"
      />
    </>
  );
}

export function TextInputNode({ data, isConnectable }: TypedNodeProps) {

  return (
    <>
      {/* Target handle for input connections */}

      <Card className="w-32 overflow-hidden p-0 shadow-lg">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex w-full flex-1 bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
            Text Input
          </div>
          <div className="p-2">
            <Button variant="outline" size="icon" className="size-8 w-full">
              <SquarePen className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Source handle for output connections */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!h-2 !w-2 translate-y-0 transform border-2 !border-gray-200 !bg-blue-500"
      />
    </>
  );
}

export function ModelSelectNode({ data, isConnectable }: TypedNodeProps) {

  return (
    <>
      {/* Target handle for input connections */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!h-2 !w-2 translate-y-0 transform border-2 !border-gray-200 !bg-blue-500"
      />

      <Card className="w-32 overflow-hidden p-0 shadow-lg">
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex w-full flex-1 bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
            Model Select
          </div>
          <div className="p-2">
            <Button variant="outline" size="icon" className="size-8 w-full">
              <SquarePen className="size-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Source handle for output connections */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!h-2 !w-2 translate-y-0 transform border-2 !border-gray-200 !bg-blue-500"
      />
    </>
  );
}
