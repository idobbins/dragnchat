"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flame, HelpCircle, MousePointer2 } from "lucide-react";
import { ProjectSelector } from "./projectselector";
import { UserSection } from "./usersection";

interface AppHeaderProps {
  isSignedIn: boolean;
}

export function AppHeader({ isSignedIn }: AppHeaderProps) {
  return (
    <div className="z-10 flex justify-between p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-foreground">
              <Flame />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-foreground" />
          <BreadcrumbItem className="text-foreground">
            <div className="text-lg hover:cursor-default">
              {isSignedIn ? "Project 1" : "Demo"}
            </div>
            <ProjectSelector />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <HelpCircle className="size-6 hover:cursor-pointer" />
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Application Instructions</h4>
              <div className="space-y-2">
                <p>
                  Set up your OpenRouter API key at{" "}
                  <a 
                    href="https://openrouter.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    OpenRouter
                  </a>.
                </p>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4" />
                  <p>Right click to add nodes.</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <UserSection />
      </div>
    </div>
  );
}
