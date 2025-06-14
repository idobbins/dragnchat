import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame } from "lucide-react";

export default async function Home() {
	return (
		<main className="flex bg-gray-50 w-screen h-screen flex-col p-4">
			<div className="flex items-center justify-between">
				<div>
					<Flame />
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Avatar>
							<AvatarImage src="https://github.com/shadcn.png" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						alignOffset={4}
						side="bottom"
						sideOffset={4}
						className="bg-white shadow-lg rounded-md"
					>
						<DropdownMenuLabel>isaac.dobbins@icloud.com</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Settings</DropdownMenuItem>
						<DropdownMenuItem className="focus:bg-white">
							<Button variant="destructive" className="w-full">Sign Out</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</main>
	);
}
