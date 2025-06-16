import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/trpc/react";
import type { OpenRouterModel } from "@/server/api/routers/openrouter";

interface OpenRouterStore {
  models: OpenRouterModel[] | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchModels: () => Promise<void>;
  refreshModels: () => Promise<void>;
  clearCache: () => void;
  isExpired: () => boolean;

  // Internal methods for React components
  _updateModels: (models: OpenRouterModel[]) => void;
  _setLoading: (isLoading: boolean) => void;
  _setError: (error: string) => void;
}

// Cache TTL: 24 hours in milliseconds
const CACHE_TTL = 24 * 60 * 60 * 1000;

export const useOpenRouterStore = create<OpenRouterStore>()(
  persist(
    (set, get) => ({
      models: null,
      lastFetched: null,
      isLoading: false,
      error: null,

      isExpired: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_TTL;
      },

      fetchModels: async () => {
        const { models, isExpired } = get();

        // Return cached models if they exist and haven't expired
        if (models && !isExpired()) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // We need to use the tRPC client directly since this is outside a React component
          // This will be called from React components that have access to the tRPC client
          throw new Error(
            "fetchModels should be called from a React component with tRPC access",
          );
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch models",
            isLoading: false,
          });
        }
      },

      refreshModels: async () => {
        // Clear cache and force fresh fetch
        set({ models: null, lastFetched: null });
        await get().fetchModels();
      },

      clearCache: () => {
        set({
          models: null,
          lastFetched: null,
          error: null,
        });
      },

      // Internal methods for React components
      _updateModels: (models: OpenRouterModel[]) => {
        set({
          models,
          lastFetched: Date.now(),
          isLoading: false,
          error: null,
        });
      },

      _setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      _setError: (error: string) => {
        set({ error, isLoading: false });
      },
    }),
    {
      name: "openrouter-models-cache",
      partialize: (state) => ({
        models: state.models,
        lastFetched: state.lastFetched,
      }),
    },
  ),
);

// Hook for React components to use the store with tRPC integration
export const useOpenRouterModels = (initialModels?: OpenRouterModel[]) => {
  const store = useOpenRouterStore();
  const trpcUtils = api.useUtils();

  // Hydrate store with initial data if provided and store is empty
  if (initialModels && !store.models && !store.lastFetched) {
    store._updateModels(initialModels);
  }

  const fetchModels = async () => {
    // Return cached models if they exist and haven't expired
    if (store.models && !store.isExpired()) {
      return store.models;
    }

    store._setLoading(true);

    try {
      const result = await trpcUtils.openrouter.getModels.fetch();
      store._updateModels(result.models);
      return result.models;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch models";
      store._setError(errorMessage);
      throw error;
    }
  };

  const refreshModels = async () => {
    store.clearCache();
    return await fetchModels();
  };

  return {
    models: store.models,
    lastFetched: store.lastFetched,
    isLoading: store.isLoading,
    error: store.error,
    isExpired: store.isExpired(),
    fetchModels,
    refreshModels,
    clearCache: store.clearCache,
  };
};
