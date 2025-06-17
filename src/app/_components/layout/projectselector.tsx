import { auth } from "@clerk/nextjs/server";
import { api } from "@/trpc/server";
import { ProjectSelectorClient } from "./projectselector-client";

// Define the Project interface - simplified for UI
interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Server component - fetches data from tRPC API
export async function ProjectSelector() {
  // Check if user is authenticated
  const user = await auth();
  
  // Don't show project interface for unauthenticated users
  if (!user.userId) {
    return null;
  }

  try {
    // Fetch real projects from tRPC API
    const dbProjects = await api.projects.getAll();
    
    // Transform database schema to simplified UI format
    const projects: Project[] = dbProjects.map(project => ({
      id: project.uuid, // Use UUID as the UI id
      name: project.name,
      createdAt: project.createdAt!,
      updatedAt: project.updatedAt!,
    }));

    return <ProjectSelectorClient projects={projects} />;
  } catch (error) {
    // Handle error case - show empty state
    console.error("Failed to fetch projects:", error);
    return <ProjectSelectorClient projects={[]} />;
  }
}
