"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Editor } from "./editor";
import { api } from "@/trpc/react";

interface EditorWithProjectProps {
  projectId?: string;
  onAuthRequired?: () => void;
}

export function EditorWithProject({
  projectId,
  onAuthRequired,
}: EditorWithProjectProps): React.ReactElement {
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;

  const [isProjectLoaded, setIsProjectLoaded] = useState(false);

  // Load project data if projectId is provided and user is authenticated
  const { data: project, isLoading } = api.projects.getById.useQuery(
    { uuid: projectId! },
    {
      enabled: !!projectId && isAuthenticated,
    },
  );

  // Handle project data loading
  useEffect(() => {
    if (project?.projectData) {
      // Project data will be handled by the Editor component itself
    }
    setIsProjectLoaded(true);
  }, [project]);

  // Handle loading error
  useEffect(() => {
    if (!isLoading && !project && projectId && isAuthenticated) {
      console.error("Failed to load project");
      setIsProjectLoaded(true); // Still allow editor to load
    }
  }, [isLoading, project, projectId, isAuthenticated]);

  // Handle save success/failure
  const handleSave = (success: boolean) => {
    if (success) {
      console.log("Project saved successfully");
    } else {
      console.error("Failed to save project");
    }
  };

  // Show loading state while project is being loaded
  if (projectId && isAuthenticated && !isProjectLoaded && isLoading) {
    return (
      <div className="absolute top-0 left-0 flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-gray-600">Loading project...</span>
        </div>
      </div>
    );
  }

  return (
    <Editor
      onSave={handleSave}
      onAuthRequired={onAuthRequired}
      autoSave={true}
    />
  );
}
