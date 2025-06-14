"use client";

import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	useAuth
} from "@clerk/nextjs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { IconBrandGoogleFilled } from '@tabler/icons-react';
import { ChevronsUpDown, Flame, MessageCirclePlus, SquarePlus } from "lucide-react";

import Editor from "./_components/Editor";

const initialNodes = [
	{ id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
	{ id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Home() {
  	const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()

	return (
		<main className="flex bg-none w-screen h-screen flex-col">
			<div className="flex items-center justify-between p-4 z-10 pointer-events-none">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink
								href="/"
								className="text-foreground pointer-events-auto"
							>
								<Flame />
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator className="text-foreground pointer-events-auto" />
						<BreadcrumbItem className="text-foreground">
							<div className="hover:cursor-default pointer-events-auto text-lg">
								{isSignedIn ? "Project 1" : "Demo"}
							</div>
							<ChevronsUpDown className="w-4 h-4 hover:cursor-pointer pointer-events-auto" />
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="flex items-center gap-4">
					<Button className="pointer-events-auto hover:cursor-pointer">
						New Chat
						<MessageCirclePlus className="size-5"/>
					</Button>
					<SignedOut>
							<SignInButton>
								<Button variant="secondary" className="pointer-events-auto hover:cursor-pointer">
									<IconBrandGoogleFilled/>
									Sign In
								</Button>
							</SignInButton>
					</SignedOut>
					<SignedIn>
						<div className="pointer-events-auto">
							<UserButton />
						</div>
					</SignedIn>
				</div>
			</div>
			{/* <Editor /> */}
		</main>
	);
}
