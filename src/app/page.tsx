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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, Flame, SquarePlus } from "lucide-react";

export default async function Home() {
	return (
		<main className="flex bg-gray-50 w-screen h-screen flex-col p-4">
			<div className="flex items-center justify-between">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/" className="text-foreground">
								<Flame />
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator className="text-foreground" />
						<BreadcrumbItem className="text-foreground">
							<div className="hover:cursor-default">Project 1</div>
							<ChevronsUpDown className="w-4 h-4 hover:cursor-pointer" />
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<div className="flex items-center gap-4">
					<Button>
						New Chat <SquarePlus />
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Avatar>
								<AvatarImage src="https://github.com/shadcn.png" />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							alignOffset={8}
							side="bottom"
							sideOffset={8}
							className="bg-white shadow-lg rounded-md"
						>
							<DropdownMenuLabel>isaac.dobbins@icloud.com</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Settings</DropdownMenuItem>
							<DropdownMenuItem className="focus:bg-white">
								<Button variant="destructive" className="w-full">
									Sign Out
								</Button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</main>
	);
}
