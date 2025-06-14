"use client";

import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ChatNodeData {
	input?: string;
	output?: string;
}

export default function ChatNode({ data, isConnectable }: NodeProps) {
	const nodeData = data as ChatNodeData;

	return (
		<>
			{/* Target handle for input connections */}
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				className="w-32 h-32 !bg-blue-500 border-2 border-white"
			/>

			<Card className="w-96 h-96 shadow-lg">
				<CardContent className="flex flex-col h-full p-0">
					<div className="flex-1 w-full p-4 flex items-center justify-center">
						<div className="text-center">
							<div className="text-sm font-medium text-gray-600 mb-2">
								Input
							</div>
							<div className="text-gray-800">
								{nodeData?.input || "Enter input..."}
							</div>
						</div>
					</div>
					<Separator />
					<div className="flex-1 w-full p-4 flex items-center justify-center">
						<div className="text-center">
							<div className="text-sm font-medium text-gray-600 mb-2">
								Output
							</div>
							<div className="text-gray-800">
								{nodeData?.output || "Awaiting output..."}
							</div>
						</div>
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
