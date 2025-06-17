"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Editor } from "./editor";
import { api } from "@/trpc/react";
import type { CustomNode, CustomEdge } from "./editor";

interface EditorWithProjectProps {
  projectId?: string;
  onAuthRequired?: () => void;
}

export function EditorWithProject({ 
  projectId, 
  onAuthRequired 
}: EditorWithProjectProps): React.ReactElement {
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;
  
  const [initialNodes, setInitialNodes] = useState<CustomNode[]>([]);
  const [initialEdges, setInitialEdges] = useState<CustomEdge[]>([]);
  const [isProjectLoaded, setIsProjectLoaded] = useState(false);

  // Load project data if projectId is provided and user is authenticated
  const { data: project, isLoading } = api.projects.getById.useQuery(
    { uuid: projectId! },
    { 
      enabled: !!projectId && isAuthenticated,
    }
  );

  // Handle project data loading
  useEffect(() => {
    if (project?.projectData) {
      const projectData = project.projectData as any;
      if (projectData.nodes) {
        setInitialNodes(projectData.nodes);
      }
      if (projectData.edges) {
        setInitialEdges(projectData.edges);
      }
    }
    setIsProjectLoaded(true);
  }, [project]);

  // Handle loading error
  useEffect(() => {
    if (!isLoading && !project && projectId && isAuthenticated) {
      console.error('Failed to load project');
      setIsProjectLoaded(true); // Still allow editor to load
    }
  }, [isLoading, project, projectId, isAuthenticated]);

  // Handle save success/failure
  const handleSave = (success: boolean) => {
    if (success) {
      console.log('Project saved successfully');
    } else {
      console.error('Failed to save project');
    }
  };

  // Show loading state while project is being loaded
  if (projectId && isAuthenticated && !isProjectLoaded && isLoading) {
    return (
      <div className="absolute top-0 left-0 h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Loading project...</span>
        </div>
      </div>
    );
  }

  return (
    <Editor
      projectId={projectId}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onSave={handleSave}
      onAuthRequired={onAuthRequired}
      autoSave={true}
    />
  );
}
