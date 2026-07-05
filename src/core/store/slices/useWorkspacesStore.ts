import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Workspace } from "@/types";

interface WorkspacesState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  
  loadWorkspaces: (userId: string) => Promise<void>;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => Promise<void>;
  removeWorkspace: (id: string) => Promise<void>;
  updateWorkspace: (workspace: Workspace) => Promise<void>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
}

const useWorkspacesStore = create<WorkspacesState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: false,

      loadWorkspaces: async (userId: string) => {
        console.log("[Zustand Store] loadWorkspaces chamado para userId:", userId);
        if (!userId) return;
        if ((window as any).electronAPI) {
          set({ isLoading: true });
          try {
            const ws = await (window as any).electronAPI.getWorkspaces(userId);
            const filteredWs = (ws || []).filter(Boolean);
            console.log("[Zustand Store] workspaces retornados do SQLite:", filteredWs);
            set({ workspaces: filteredWs, isLoading: false });
            
            // Sincroniza o workspace ativo
            const currentActive = get().activeWorkspace;
            if (currentActive) {
              const updatedActive = filteredWs.find((w: Workspace) => w.id === currentActive.id);
              if (updatedActive) {
                set({ activeWorkspace: updatedActive });
              } else {
                set({ activeWorkspace: filteredWs.length > 0 ? filteredWs[0] : null });
              }
            } else if (filteredWs.length > 0) {
              set({ activeWorkspace: filteredWs[0] });
            }
          } catch (err) {
            console.error("Erro ao carregar workspaces do SQLite:", err);
            set({ isLoading: false });
          }
        }
      },

      setWorkspaces: (workspaces: Workspace[]) => set(() => ({ workspaces: (workspaces || []).filter(Boolean) })),

      addWorkspace: async (workspace: Workspace) => {
        console.log("[Zustand Store] addWorkspace iniciado para o workspace:", workspace.name);
        if ((window as any).electronAPI) {
          try {
            const result = await (window as any).electronAPI.createWorkspace({
              name: workspace.name,
              ownerId: workspace.ownerId,
              icon: workspace.icon,
              description: workspace.description || "",
            });
            console.log("[Zustand Store] createWorkspace retornado do SQLite com sucesso:", result);

            if (result) {
              set((state) => ({
                workspaces: [...(state.workspaces || []).filter(Boolean), result],
                activeWorkspace: state.activeWorkspace ? state.activeWorkspace : result,
              }));
            }
          } catch (err) {
            console.error("Erro ao salvar novo workspace no SQLite:", err);
          }
        }
      },

      removeWorkspace: async (id: string) => {
        console.log("[Zustand Store] removeWorkspace iniciado para id:", id);
        if ((window as any).electronAPI) {
          try {
            const success = await (window as any).electronAPI.deleteWorkspace(id);
            console.log("[Zustand Store] deleteWorkspace retornado do SQLite:", success);
            if (success) {
              set((state) => {
                const filtered = (state.workspaces || []).filter((w) => w && w.id !== id);
                return {
                  workspaces: filtered,
                  activeWorkspace: state.activeWorkspace?.id === id ? (filtered[0] || null) : state.activeWorkspace,
                };
              });
            }
          } catch (err) {
            console.error("Erro ao deletar workspace no SQLite:", err);
          }
        }
      },

      updateWorkspace: async (updatedWorkspace: Workspace) => {
        console.log("[Zustand Store] updateWorkspace iniciado para:", updatedWorkspace.name);
        if ((window as any).electronAPI) {
          try {
            const success = await (window as any).electronAPI.updateWorkspace({
              id: updatedWorkspace.id,
              name: updatedWorkspace.name,
              description: updatedWorkspace.description,
              icon: updatedWorkspace.icon,
            });
            console.log("[Zustand Store] updateWorkspace retornado do SQLite:", success);
            if (success) {
              set((state) => ({
                workspaces: (state.workspaces || []).filter(Boolean).map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)),
                activeWorkspace: state.activeWorkspace?.id === updatedWorkspace.id ? updatedWorkspace : state.activeWorkspace,
              }));
            }
          } catch (err) {
            console.error("Erro ao atualizar workspace no SQLite:", err);
          }
        }
      },

      setActiveWorkspace: (workspace: Workspace | null) => set(() => ({ activeWorkspace: workspace })),
    }),
    {
      name: "httpclient-workspaces-storage",
      partialize: (state) => ({
        activeWorkspace: state.activeWorkspace,
        workspaces: state.workspaces,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.workspaces) {
            state.workspaces = state.workspaces.filter(Boolean);
          }
          if (!state.activeWorkspace && state.workspaces.length > 0) {
            state.activeWorkspace = state.workspaces[0];
          }
        }
      },
    }
  )
);

export default useWorkspacesStore;