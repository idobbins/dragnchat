"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import {
	FilePlus,
	ImagePlus,
	SquarePen,
} from "lucide-react";
interface ChatNodeData {
	input?: string;
	output?: string;
}

export function FileInputNode({ data, isConnectable }: NodeProps) {
	const nodeData = data as ChatNodeData;

	return (
		<>
			{/* Target handle for input connections */}

			<Card className="shadow-lg p-0 overflow-hidden w-32">
				<CardContent className="flex flex-col h-full p-0">
					<div className="flex-1 w-full flex text-xs bg-green-500 px-2 py-1 text-white font-semibold">
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
				className="w-32 h-32 !bg-green-500 border-2 border-white"
			/>
		</>
	);
}


export function ImageInputNode({ data, isConnectable }: NodeProps) {
	const nodeData = data as ChatNodeData;

	return (
		<>
			{/* Target handle for input connections */}

			<Card className="shadow-lg p-0 overflow-hidden w-32">
				<CardContent className="flex flex-col h-full p-0">
					<div className="flex-1 w-full flex text-xs bg-red-500 px-2 py-1 text-white font-semibold">
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
				className="w-32 h-32 !bg-green-500 border-2 border-white"
			/>
		</>
	);
}


export function TextInputNode({ data, isConnectable }: NodeProps) {
	const nodeData = data as ChatNodeData;

	return (
		<>
			{/* Target handle for input connections */}

			<Card className="shadow-lg p-0 overflow-hidden w-32">
				<CardContent className="flex flex-col h-full p-0">
					<div className="flex-1 w-full flex text-xs bg-blue-500 px-2 py-1 text-white font-semibold">
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
				className="w-32 h-32 !bg-green-500 border-2 border-white"
			/>
		</>
	);
}

