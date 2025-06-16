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
import { ArrowRight, ChevronsUpDown, MessageCirclePlus } from "lucide-react";
import { useState } from "react";

// Define the Project interface
interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectSelectorClientProps {
  projects: Project[];
}

export function ProjectSelectorClient({ projects }: ProjectSelectorClientProps) {
  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    // In the future, this could trigger a database update or navigation
    console.log(`Selected project: ${project.name}`);
  };

  // Handle creating a new project
  const handleCreateProject = () => {
    // This would be replaced with actual database interaction
    console.log("Create new project clicked");
  };

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
          <Input
            type="search"
            placeholder="Find Chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            size="icon"
            className="size-8 hover:cursor-pointer"
            onClick={handleCreateProject}
          >
            <MessageCirclePlus className="size-5" />
          </Button>
        </DropdownMenuLabel>

        {filteredProjects.length === 0 ? (
          <DropdownMenuItem disabled>No projects found</DropdownMenuItem>
        ) : (
          filteredProjects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className="flex items-center justify-between"
              onClick={() => handleSelectProject(project)}
            >
              {project.name}
              <ArrowRight />
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
