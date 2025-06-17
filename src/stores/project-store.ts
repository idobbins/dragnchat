import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/trpc/react";

// Define the Project interface to match the UI format
interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectStore {
  selectedProject: Project | null;
  projects: Project[] | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  selectProject: (project: Project) => void;
  clearSelection: () => void;
  fetchProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  createProject: (name: string, projectData?: Record<string, any>) => Promise<Project>;
  updateProject: (uuid: string, updates: { name?: string; projectData?: Record<string, any> }) => Promise<Project>;
  deleteProject: (uuid: string) => Promise<void>;
  autoSelectMostRecent: () => void;
  isExpired: () => boolean;

  // Internal methods for React components
  _updateProjects: (projects: Project[]) => void;
  _setLoading: (isLoading: boolean) => void;
  _setError: (error: string) => void;
  _setSelectedProject: (project: Project | null) => void;
}

// Cache TTL: 5 minutes in milliseconds (shorter than openrouter since projects change more frequently)
const CACHE_TTL = 5 * 60 * 1000;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      selectedProject: null,
      projects: null,
      lastFetched: null,
      isLoading: false,
      error: null,

      isExpired: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_TTL;
      },

      selectProject: (project: Project) => {
        set({ selectedProject: project });
      },

      clearSelection: () => {
        set({ selectedProject: null });
      },

      autoSelectMostRecent: () => {
        const { projects } = get();
        if (projects && projects.length > 0) {
          // Projects are already ordered by updatedAt desc from the tRPC query
          const mostRecent = projects[0];
          if (mostRecent) {
            set({ selectedProject: mostRecent });
          }
        }
      },

      fetchProjects: async () => {
        const { projects, isExpired } = get();

        // Return cached projects if they exist and haven't expired
        if (projects && !isExpired()) {
          return;
        }

        // This will be called from React components that have access to the tRPC client
        throw new Error(
          "fetchProjects should be called from a React component with tRPC access",
        );
      },

      refreshProjects: async () => {
        // Clear cache and force fresh fetch
        set({ projects: null, lastFetched: null });
        await get().fetchProjects();
      },

      createProject: async (name: string, projectData = {}) => {
        throw new Error(
          "createProject should be called from a React component with tRPC access",
        );
      },

      updateProject: async (uuid: string, updates) => {
        throw new Error(
          "updateProject should be called from a React component with tRPC access",
        );
      },

      deleteProject: async (uuid: string) => {
        throw new Error(
          "deleteProject should be called from a React component with tRPC access",
        );
      },

      // Internal methods for React components
      _updateProjects: (projects: Project[]) => {
        const { selectedProject } = get();
        set({
          projects,
          lastFetched: Date.now(),
          isLoading: false,
          error: null,
        });

        // Auto-select most recent if no project is currently selected
        if (!selectedProject && projects.length > 0) {
          const firstProject = projects[0];
          if (firstProject) {
            set({ selectedProject: firstProject });
          }
        }
      },

      _setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      _setError: (error: string) => {
        set({ error, isLoading: false });
      },

      _setSelectedProject: (project: Project | null) => {
        set({ selectedProject: project });
      },
    }),
    {
      name: "project-selection-store",
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        projects: state.projects,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

// Hook for React components to use the store with tRPC integration
export const useProjectSelection = (initialProjects?: Project[]) => {
  const store = useProjectStore();
  const trpcUtils = api.useUtils();

  // Set up tRPC mutations
  const createProjectMutation = api.projects.create.useMutation();
  const updateProjectMutation = api.projects.update.useMutation();
  const deleteProjectMutation = api.projects.delete.useMutation();

  // Hydrate store with initial data if provided and store is empty
  if (initialProjects && !store.projects && !store.lastFetched) {
    store._updateProjects(initialProjects);
  }

  const fetchProjects = async () => {
    // Return cached projects if they exist and haven't expired
    if (store.projects && !store.isExpired()) {
      return store.projects;
    }

    store._setLoading(true);

    try {
      const dbProjects = await trpcUtils.projects.getAll.fetch();
      
      // Transform database schema to simplified UI format
      const projects: Project[] = dbProjects.map(project => ({
        id: project.uuid || '', // Use UUID as the UI id
        name: project.name || '',
        createdAt: project.createdAt || new Date(),
        updatedAt: project.updatedAt || new Date(),
      }));

      store._updateProjects(projects);
      return projects;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch projects";
      store._setError(errorMessage);
      throw error;
    }
  };

  const refreshProjects = async () => {
    store._setLoading(true);
    store._setError("");
    return await fetchProjects();
  };

  const createProject = async (name: string, projectData: Record<string, any> = {}) => {
    store._setLoading(true);
    store._setError("");

    try {
      const newDbProject = await createProjectMutation.mutateAsync({
        name,
        projectData,
      });

      // Transform to UI format
      const newProject: Project = {
        id: newDbProject?.uuid || '',
        name: newDbProject?.name || '',
        createdAt: newDbProject?.createdAt || new Date(),
        updatedAt: newDbProject?.updatedAt || new Date(),
      };

      // Validate that we have the required fields
      if (!newProject.id) {
        throw new Error("Failed to create project: missing UUID");
      }

      // Auto-select the new project
      store._setSelectedProject(newProject);

      // Refresh projects to get updated list
      await fetchProjects();

      return newProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create project";
      store._setError(errorMessage);
      throw error;
    }
  };

  const updateProject = async (uuid: string, updates: { name?: string; projectData?: Record<string, any> }) => {
    store._setLoading(true);
    store._setError("");

    try {
      const updatedDbProject = await updateProjectMutation.mutateAsync({
        uuid,
        ...updates,
      });

      // Transform to UI format
      const updatedProject: Project = {
        id: updatedDbProject?.uuid || '',
        name: updatedDbProject?.name || '',
        createdAt: updatedDbProject?.createdAt || new Date(),
        updatedAt: updatedDbProject?.updatedAt || new Date(),
      };

      // Validate that we have the required fields
      if (!updatedProject.id) {
        throw new Error("Failed to update project: missing UUID");
      }

      // Update selected project if it's the one being updated
      const { selectedProject } = store;
      if (selectedProject && selectedProject.id === uuid) {
        store._setSelectedProject(updatedProject);
      }

      // Refresh projects to get updated list
      await fetchProjects();

      return updatedProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update project";
      store._setError(errorMessage);
      throw error;
    }
  };

  const deleteProject = async (uuid: string) => {
    store._setLoading(true);
    store._setError("");

    try {
      await deleteProjectMutation.mutateAsync({ uuid });

      // Clear selection if the deleted project was selected
      const { selectedProject } = store;
      if (selectedProject && selectedProject.id === uuid) {
        store._setSelectedProject(null);
      }

      // Refresh projects and auto-select most recent if needed
      await fetchProjects();
      
      // If we cleared the selection, auto-select the most recent project
      if (selectedProject && selectedProject.id === uuid) {
        store.autoSelectMostRecent();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete project";
      store._setError(errorMessage);
      throw error;
    }
  };

  return {
    selectedProject: store.selectedProject,
    projects: store.projects,
    lastFetched: store.lastFetched,
    isLoading: store.isLoading || createProjectMutation.isPending || updateProjectMutation.isPending || deleteProjectMutation.isPending,
    error: store.error,
    isExpired: store.isExpired(),
    selectProject: store.selectProject,
    clearSelection: store.clearSelection,
    autoSelectMostRecent: store.autoSelectMostRecent,
    fetchProjects,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
