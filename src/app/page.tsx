"use client";

import {
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  Flame,
  MessageCirclePlus,
} from "lucide-react";

import Editor from "./_components/editor";
import { LoginButton } from "./_components/loginbutton";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <main className="flex h-screen w-screen flex-col bg-none">
      <div className="pointer-events-none z-10 flex items-center justify-between p-4">
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
              <div className="pointer-events-auto text-lg hover:cursor-default">
                {isSignedIn ? "Project 1" : "Demo"}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <ChevronsUpDown className="pointer-events-auto h-4 w-4 hover:cursor-pointer" />
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
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
          <SignedOut>
            <LoginButton />
          </SignedOut>
          <SignedIn>
            <div className="pointer-events-auto">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
      <Editor />
    </main>
  );
}
