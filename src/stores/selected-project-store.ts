import { create } from "zustand";
import { persist } from "zustand/middleware";

// Use the database schema type directly from tRPC
type Project = {
  id: number;
  uuid: string;
  name: string;
  userId: string;
  projectData: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
};

interface SelectedProjectStore {
  selectedProject: Project | null;
  selectProject: (project: Project) => void;
  clearSelection: () => void;
}

export const useSelectedProjectStore = create<SelectedProjectStore>()(
  persist(
    (set) => ({
      selectedProject: null,

      selectProject: (project: Project) => {
        set({ selectedProject: project });
      },

      clearSelection: () => {
        set({ selectedProject: null });
      },
    }),
    {
      name: "selected-project-store",
      partialize: (state) => ({
        selectedProject: state.selectedProject,
      }),
    },
  ),
);
