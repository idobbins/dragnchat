import { ProjectSelectorClient } from "./projectselector-client";

// Define the Project interface
interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Server-side hardcoded data - simulates database fetch
const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Marketing Campaign",
    createdAt: new Date("2025-05-01"),
    updatedAt: new Date("2025-06-10"),
  },
  {
    id: "2",
    name: "Product Launch",
    createdAt: new Date("2025-04-15"),
    updatedAt: new Date("2025-06-12"),
  },
  {
    id: "3",
    name: "Website Redesign",
    createdAt: new Date("2025-03-20"),
    updatedAt: new Date("2025-06-08"),
  },
  {
    id: "4",
    name: "Customer Research",
    createdAt: new Date("2025-05-25"),
    updatedAt: new Date("2025-06-14"),
  },
  {
    id: "5",
    name: "Quarterly Report",
    createdAt: new Date("2025-06-01"),
    updatedAt: new Date("2025-06-15"),
  },
];

// Server component - fetches data and passes to client
export function ProjectSelector() {
  // In a real app, this would be: const projects = await fetchProjects();
  const projects = MOCK_PROJECTS;

  return <ProjectSelectorClient projects={projects} />;
}
