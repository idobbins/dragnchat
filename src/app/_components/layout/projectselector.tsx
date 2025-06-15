"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  ChevronsUpDown,
  MessageCirclePlus,
} from "lucide-react";

export function ProjectSelector() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ChevronsUpDown className="h-4 w-4 hover:cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={8}
        side="bottom"
        sideOffset={8}
        className="w-96 rounded-md bg-white shadow-lg"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Input type="search" placeholder="Find Chats"></Input>
          <Button size="icon" className="size-8">
            <MessageCirclePlus className="size-5" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuItem className="flex items-center justify-between">
          Lorem Ipsum
          <ArrowRight />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          Lorem Ipsum
          <ArrowRight />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          Lorem Ipsum
          <ArrowRight />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          Lorem Ipsum
          <ArrowRight />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center justify-between">
          Lorem Ipsum
          <ArrowRight />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
