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
import { ArrowRight, Check, ChevronsUpDown, MessageCirclePlus } from "lucide-react";
import { useState } from "react";
import { useProjectSelection } from "@/stores/project-store";

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

export function ProjectSelectorClient({
  projects,
}: ProjectSelectorClientProps) {
  // Use the project selection store
  const {
    selectedProject,
    selectProject,
    createProject,
    isLoading,
    error,
  } = useProjectSelection(projects);

  // State for search input and new project creation
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    selectProject(project);
  };

  // Handle creating a new project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    try {
      await createProject(newProjectName.trim());
      setNewProjectName("");
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle starting project creation
  const startCreatingProject = () => {
    setNewProjectName(searchQuery);
    setSearchQuery("");
  };

  // Handle canceling project creation
  const cancelCreatingProject = () => {
    setNewProjectName("");
    setIsCreating(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:cursor-pointer">
        <span className="text-sm font-medium">
          {selectedProject ? selectedProject.name : "Select Project"}
        </span>
        <ChevronsUpDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        alignOffset={8}
        side="bottom"
        sideOffset={8}
        className="w-96 rounded-md bg-white shadow-lg"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          {isCreating ? (
            <>
              <Input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateProject();
                  } else if (e.key === "Escape") {
                    cancelCreatingProject();
                  }
                }}
                autoFocus
              />
              <Button
                size="icon"
                className="size-8"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isLoading}
              >
                <Check className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Input
                type="search"
                placeholder="Find or create project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                size="icon"
                className="size-8 hover:cursor-pointer"
                onClick={startCreatingProject}
                disabled={isLoading}
              >
                <MessageCirclePlus className="size-5" />
              </Button>
            </>
          )}
        </DropdownMenuLabel>

        {error && (
          <DropdownMenuItem disabled className="text-red-600">
            Error: {error}
          </DropdownMenuItem>
        )}

        {isLoading && (
          <DropdownMenuItem disabled>
            Loading...
          </DropdownMenuItem>
        )}

        {!isCreating && filteredProjects.length === 0 && searchQuery && (
          <DropdownMenuItem onClick={startCreatingProject}>
            Create "{searchQuery}"
          </DropdownMenuItem>
        )}

        {!isCreating && filteredProjects.length === 0 && !searchQuery && (
          <DropdownMenuItem disabled>No projects found</DropdownMenuItem>
        )}

        {!isCreating && filteredProjects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            className="flex items-center justify-between"
            onClick={() => handleSelectProject(project)}
          >
            <span className="flex items-center gap-2">
              {selectedProject?.id === project.id && (
                <Check className="h-4 w-4" />
              )}
              {project.name}
            </span>
            <ArrowRight className="h-4 w-4" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
