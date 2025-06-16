"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Flame } from "lucide-react";
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
      <UserSection isSignedIn={isSignedIn} />
    </div>
  );
}
