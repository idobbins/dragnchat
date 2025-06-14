"use client";

import React, { useCallback, useMemo } from "react";
import {
	ReactFlow,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	type Connection,
	BackgroundVariant,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import ChatNode from "./ChatNode";

const initialNodes = [
	{
		id: "1",
		type: "chatNode",
		position: { x: 100, y: 100 },
		data: {
			input: "Hello, this is the input text",
			output: "This is the generated output",
		},
	},
	{
		id: "2",
		type: "chatNode",
		position: { x: 500, y: 300 },
		data: {
			input: "Another chat node",
			output: "With different content",
		},
	},
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function App() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Define custom node types - memoized to prevent re-renders
	const nodeTypes = useMemo(
		() => ({
			chatNode: ChatNode,
		}),
		[],
	);

	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	return (
		<div className="absolute w-screen h-screen">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				fitView
			>
				<Controls />
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
			</ReactFlow>
		</div>
	);
}
