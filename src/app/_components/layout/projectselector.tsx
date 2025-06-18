"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelectedProjectStore } from "@/stores/selected-project-store";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export function ProjectSelector() {
  const { isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  
  // Simple store for selected project
  const { selectedProject, selectProject } = useSelectedProjectStore();
  
  // tRPC queries and mutations
  const { 
    data: projects, 
    isLoading: isLoadingProjects, 
    error: projectsError 
  } = api.projects.getAll.useQuery(undefined, {
    enabled: isSignedIn, // Only fetch when user is signed in
  });
  
  const createProjectMutation = api.projects.create.useMutation({
    onSuccess: (newProject) => {
      // Auto-select the newly created project
      if (newProject) {
        selectProject(newProject);
        setOpen(false);
      }
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
  });
  
  const trpcUtils = api.useUtils();
  
  // Auto-select most recent project if none selected and projects exist
  useEffect(() => {
    if (!selectedProject && projects && projects.length > 0) {
      // Projects are ordered by updatedAt desc from the tRPC query
      const firstProject = projects[0];
      if (firstProject) {
        selectProject(firstProject);
      }
    }
  }, [projects, selectedProject, selectProject]);
  
  // Don't render anything while Clerk is loading
  if (!isLoaded) {
    return null;
  }

  // Don't show project interface for unauthenticated users
  if (!isSignedIn) {
    return null;
  }

  // Handle project selection
  const handleSelectProject = (project: NonNullable<typeof projects>[0]) => {
    selectProject(project);
    setOpen(false);
  };

  // Handle creating a new project from command input
  const handleCreateProject = async (projectName: string) => {
    if (!projectName.trim()) return;
    
    try {
      await createProjectMutation.mutateAsync({
        name: projectName.trim(),
        projectData: {},
      });
      
      // Invalidate and refetch projects to get the updated list
      await trpcUtils.projects.getAll.invalidate();
    } catch {
      // Error is already logged in the mutation's onError
    }
  };

  const isLoading = isLoadingProjects || createProjectMutation.isPending;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedProject ? selectedProject.name : "Select Project"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Find or create project..." className="h-9" />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-2">No projects found.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const input = document.querySelector('[cmdk-input]');
                    if (input && 'value' in input && typeof input.value === 'string' && input.value.trim()) {
                      void handleCreateProject(input.value);
                    }
                  }}
                  disabled={createProjectMutation.isPending}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Create new project
                </Button>
              </div>
            </CommandEmpty>
            
            {projectsError && (
              <CommandItem disabled className="text-red-600 justify-center">
                Error: {projectsError.message}
              </CommandItem>
            )}

            {isLoading && (
              <CommandItem disabled className="justify-center">
                Loading...
              </CommandItem>
            )}

            <CommandGroup>
              {projects?.map((project) => (
                <CommandItem
                  key={project.uuid}
                  value={project.name}
                  onSelect={() => handleSelectProject(project)}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedProject?.uuid === project.uuid
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {project.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
