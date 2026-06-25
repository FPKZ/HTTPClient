import { StateCreator } from "zustand";
import * as utils from "@/utils/collectionUtils";
import { CollectionSlice, TabSlice, Variable } from "@/core/store";

/**
 * collectionSlice.ts
 * Gerenciamento do estado da coleção e sincronização com abas.
 */

// Interface combinada para o store total (necessário para o StateCreator)
type FullStore = CollectionSlice & TabSlice;

export const createCollectionSlice: StateCreator<FullStore, [], [], CollectionSlice> = (set, get) => {
  const envUpdateTimeouts: Record<string, NodeJS.Timeout> = {};
  const envInitialNames: Record<string, string> = {};
  const varUpdateTimeouts: Record<string, NodeJS.Timeout> = {};
  const varInitialStates: Record<string, Partial<Variable>> = {};

  /* Helper para log debounce de variáveis (Global e Ambiente) */
  const scheduleVariableLog = (varId: string, logLabel: string, getCurrentVarFn: () => Variable | undefined) => {
    // Inicializa estado original se não existir
    if (!varInitialStates[varId]) {
      const v = getCurrentVarFn();
      if (v) {
        varInitialStates[varId] = {
          key: v.key,
          value: v.value,
          currentValue: v.currentValue,
          initialValue: v.initialValue,
        };
      }
    }

    if (varUpdateTimeouts[varId]) clearTimeout(varUpdateTimeouts[varId]);

    varUpdateTimeouts[varId] = setTimeout(() => {
      const initial = varInitialStates[varId];
      const current = getCurrentVarFn();

      if (initial && current) {
        if (initial.key !== current.key) {
          window.electronAPI.logAction(
            `Alterando o nome da ${logLabel}: ${initial.key}, para: ${current.key}`
          );
        } else {
          if (initial.value !== undefined && initial.value !== current.value) {
            window.electronAPI.logAction(`Alterando o valor da ${logLabel}: ${current.key}`);
          }
          if (initial.currentValue !== undefined && initial.currentValue !== current.currentValue) {
            window.electronAPI.logAction(`Alterando o Valor Atual da ${logLabel}: ${current.key}`);
          }
          if (initial.initialValue !== undefined && initial.initialValue !== current.initialValue) {
            window.electronAPI.logAction(`Alterando o Valor Inicial da ${logLabel}: ${current.key}`);
          }
        }
      }

      delete varUpdateTimeouts[varId];
      delete varInitialStates[varId];
    }, 1000);
  };

  return {
    collection: {
      id: null,
      name: "",
      description: "",
      items: [],
      environments: [],
      activeEnvironmentId: null,
    },
    globals: [],
    clipboard: null,
    isDraggingDisabled: false,

    setDraggingDisabled: (disabled: boolean) => set({ isDraggingDisabled: disabled }),

    loadCollection: (data: any) => {
      const currentCollectionId = get().collection.id;
      if (currentCollectionId) {
        get().saveTabsState(currentCollectionId);
      }

      const newCollectionId = data?.id || `coll_${Date.now()}`;
      const name = data?.name || data?.collectionName || "Collection";
      const description = data?.descricao || data?.description || "";

      const rawItems =
        data?.items ||
        data?.content?.items ||
        data?.routes ||
        data?.content?.routes ||
        [];

      let environments = data?.environments || [];
      let activeEnvironmentId = data?.activeEnvironmentId || null;

      if (environments.length > 0 && !environments[0].variables) {
        environments = [
          {
            id: "env_migrated",
            name: "Importado",
            variables: environments.map((v: any) => ({
              id: `var_${Math.random().toString(36).substr(2, 9)}`,
              key: v.name || "",
              initialValue: v.value || "",
              currentValue: v.value || "",
              enabled: v.enabled !== undefined ? v.enabled : true,
            })),
          },
        ];
        activeEnvironmentId = "env_migrated";
      }

      // Pré-salva no SQLite para garantir a persistência dos dados ricos importados
      window.electronAPI.saveHistory({
        id: newCollectionId,
        name,
        description,
        items: rawItems,
        environments,
        activeEnvironmentId
      }).catch((err) => console.error("Erro ao pré-salvar coleção carregada:", err));

      const cleanItems = utils.normalizeItems(rawItems);

      window.electronAPI.logAction("Coleção carregada: " + name);
      set({
        collection: {
          id: newCollectionId,
          name,
          description,
          items: cleanItems,
          environments,
          activeEnvironmentId,
        },
      });

      if (newCollectionId) {
        get().restoreTabsState(newCollectionId);
      } else {
        set({
          tabs: [],
          activeTabId: null,
        });
      }
    },

    saveTabToCollection: (id: string) => {
      const { tabs, collection } = get();
      const tab = tabs.find((t) => t.id === id);
      if (!tab) return;

      if (!tab.screenKey) return;
      const routeExists = utils.findItemById(collection.items, tab.screenKey);

      const requestToSave = tab.data?.request || {
        method: tab.method || "GET",
        url: tab.url || "",
        headers: [],
        params: [],
        body: { mode: "none", content: "" },
      };

      if (!routeExists) {
        const newRoute = {
          id: tab.screenKey || `route_${Date.now()}`,
          type: "route",
          name: tab.title,
          method: tab.method || "GET",
        };

        window.electronAPI.saveRequestDetails(newRoute.id, {
          name: tab.title,
          method: tab.method || "GET",
          url: tab.url || "",
          ...requestToSave,
          isDirty: false,
        }).then(() => {
          set({
            collection: {
              ...collection,
              items: [...collection.items, newRoute],
            },
            tabs: tabs.map((t) =>
              t.id === id ? { ...t, screenKey: newRoute.id, isDirty: false } : t
            ),
          });
        }).catch(console.error);
        return;
      }

      const updatedItems = utils.updateItemInTree(
        collection.items,
        tab.screenKey!,
        {
          name: tab.title,
          method: tab.method || "GET",
        }
      );
      window.electronAPI.logAction("Salvando alterações na rota: " + tab.title);

      window.electronAPI.saveRequestDetails(tab.screenKey, {
        name: tab.title,
        method: tab.method || "GET",
        url: tab.url || "",
        ...requestToSave,
        isDirty: false,
      }).then(() => {
        set({
          collection: { ...collection, items: updatedItems },
          tabs: tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
        });
      }).catch(console.error);
    },

    addRoute: (parentId: string | null = null, name: string = "Nova Rota") => {
      const { collection } = get();
      const newRouteId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newRoute: any = {
        id: newRouteId,
        type: "route",
        name: name || "Nova Rota",
        method: "GET",
      };

      const initialRequest = {
        method: "GET",
        url: "",
        headers: [
          { key: "Content-Type", value: "application/json", enabled: true },
        ],
        params: [],
        body: { mode: "json", content: "" },
        auth: {
          name: "none",
          config: { key: "", type: "Bearer", value: "header" },
        },
      };

      const updatedItems = utils.addItemToTree(
        collection.items,
        parentId,
        newRoute
      );
      set({ collection: { ...collection, items: updatedItems } });

      window.electronAPI.saveRequestDetails(newRouteId, {
        name: newRoute.name,
        ...initialRequest,
        isDirty: false,
      }).then(() => {
        get().addTab(newRoute.id, newRoute);
      }).catch((err) => {
        console.error("Erro ao salvar detalhes da rota inicial:", err);
        get().addTab(newRoute.id, { ...newRoute, request: initialRequest });
      });
    },

    duplicateRoute: async (id: string) => {
      const { collection, tabs } = get();
      const route = utils.findItemById(collection.items, id);
      if (!route) return;

      let requestDetails = null;
      const tabForRoute = tabs.find((t) => t.screenKey === id);
      if (tabForRoute && tabForRoute.data?.request) {
        requestDetails = JSON.parse(JSON.stringify(tabForRoute.data.request));
      } else {
        try {
          requestDetails = await window.electronAPI.getRequestDetails(id);
        } catch (err) {
          console.error("Erro ao obter detalhes para duplicação:", err);
        }
      }

      if (!requestDetails) {
        requestDetails = {
          method: (route as any).method || "GET",
          url: "",
          headers: [],
          params: [],
          body: { mode: "none", content: "" },
        };
      }

      const newRouteId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newRoute: any = {
        id: newRouteId,
        type: "route",
        name: route.name + " (Cópia)",
        method: (route as any).method || requestDetails.method || "GET",
      };

      const path = utils.findItemPath(collection.items, id);
      if (path) {
        const insertPath = [...path];
        insertPath[insertPath.length - 1] += 1;

        const updatedItems = utils.insertItemByPath(
          collection.items,
          insertPath,
          newRoute
        );

        window.electronAPI.logAction("Duplicada a rota: " + route.name);
        set({ collection: { ...collection, items: updatedItems } });

        try {
          await window.electronAPI.saveRequestDetails(newRouteId, {
            name: newRoute.name,
            ...requestDetails,
            isDirty: false,
          });
        } catch (err) {
          console.error("Erro ao persistir detalhes duplicados:", err);
        }

        get().addTab(newRoute.id, newRoute);
      }
    },

    copyRoute: (id: string) => {
      const { collection } = get();
      const item = utils.findItemById(collection.items, id);
      if (!item) return;

      const itemCopy = JSON.parse(JSON.stringify(item));
      set({ clipboard: { ...itemCopy, name: itemCopy.name + " (Cópia)" } });

      window.electronAPI.logAction(`Copiado para a área de transferência: ${itemCopy.name}`);
    },

    pasteRoute: (targetId: string | null) => {
      const { clipboard, collection } = get();
      if (!clipboard) return;

      const newItem = utils.regenerateIds(clipboard);
      let updatedItems;

      if (!targetId) {
        updatedItems = utils.addItemToTree(collection.items, null, newItem);
      } else {
        const targetItem = utils.findItemById(collection.items, targetId);

        if (targetItem && targetItem.type === "folder") {
          updatedItems = utils.addItemToTree(collection.items, targetId, newItem);
        } else {
          const targetPath = utils.findItemPath(collection.items, targetId);
          if (targetPath) {
            const insertPath = [...targetPath];
            insertPath[insertPath.length - 1] += 1;
            updatedItems = utils.insertItemByPath(collection.items, insertPath, newItem);
          } else {
            updatedItems = utils.addItemToTree(collection.items, null, newItem);
          }
        }
      }

      window.electronAPI.logAction(`Colado: ${newItem.name}`);
      set({ collection: { ...collection, items: updatedItems } });

      if (newItem.type === "route") {
        get().addTab(newItem.id, newItem);
      }
      set({ clipboard: null });
    },

    addFolder: (parentId: string | null = null, name: string = "Nova Pasta") => {
      const { collection } = get();
      const newFolder: any = {
        id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: "folder",
        name: name || "Nova Pasta",
        items: [],
      };

      const updatedItems = utils.addItemToTree(
        collection.items,
        parentId,
        newFolder
      );
      set({ collection: { ...collection, items: updatedItems } });
    },

    deleteItem: (id: string) => {
      const { collection, tabs } = get();
      const itemToDelete = utils.findItemById(collection.items, id);
      if (!itemToDelete) return;

      const idsToClose = utils.collectRouteIds(itemToDelete);
      const updatedItems = utils.removeItemFromTree(collection.items, id);

      set({
        collection: { ...collection, items: updatedItems },
        tabs: tabs.filter((tab) => !idsToClose.includes(tab.screenKey!)),
      });
    },

    renameItem: (id: string, newName: string) => {
      const { collection, tabs } = get();
      const updatedItems = utils.updateItemInTree(collection.items, id, {
        name: newName,
      });

      set({
        collection: { ...collection, items: updatedItems },
        tabs: tabs.map((tab) =>
          tab.screenKey === id ? { ...tab, title: newName } : tab
        ),
      });
    },

    moveItemToFolder: (activeId: string, folderId: string | null) => {
      const { collection } = get();
      if (activeId === folderId) return;

      const activePath = utils.findItemPath(collection.items, activeId);
      if (!activePath) return;

      let sourceName = "Raiz";
      if (activePath.length > 1) {
        const parentPath = activePath.slice(0, -1);
        const parentItem = utils.getItemByPath(collection.items, parentPath);
        sourceName = parentItem ? parentItem.name : "Raiz";
      }

      let targetName = "Raiz";
      if (folderId) {
        const targetFolder = utils.findItemById(collection.items, folderId);
        targetName = targetFolder ? targetFolder.name : "Raiz";
      }

      const itemToMove = utils.getItemByPath(collection.items, activePath);

      window.electronAPI.logAction(
        `Movendo ${activeId}: ${itemToMove.name}, de: ${sourceName}, para: ${targetName}`
      );

      let updatedItems = utils.removeItemByPath(collection.items, activePath);
      updatedItems = utils.addItemToTree(updatedItems, folderId, itemToMove, false);

      set({ collection: { ...collection, items: updatedItems } });
    },

    reorderItems: (activeId: string, overId: string | null) => {
      if (activeId === overId) return;
      const { collection } = get();

      const activePath = utils.findItemPath(collection.items, activeId);
      const overPath = overId
        ? utils.findItemPath(collection.items, overId)
        : [collection.items.length];
      if (!activePath || !overPath) return;

      let sourceName = "Raiz";
      if (activePath.length > 1) {
        const parentPath = activePath.slice(0, -1);
        const parentItem = utils.getItemByPath(collection.items, parentPath);
        sourceName = parentItem ? parentItem.name : "Raiz";
      }

      let targetName = "Raiz";
      if (overPath.length > 1) {
        const parentPath = overPath.slice(0, -1);
        const parentItem = utils.getItemByPath(collection.items, parentPath);
        targetName = parentItem ? parentItem.name : "Raiz";
      }

      const itemToMove = utils.getItemByPath(collection.items, activePath);

      if (sourceName !== targetName) {
        window.electronAPI.logAction(
          `Movendo ${activeId}: ${itemToMove.name}, de: ${sourceName}, para: ${targetName}`
        );
      } else {
        window.electronAPI.logAction(
          `Reordenando ${activeId}: ${itemToMove.name}, em: ${sourceName}`
        );
      }

      let updatedItems = utils.removeItemByPath(collection.items, activePath);
      updatedItems = utils.insertItemByPath(updatedItems, overPath, itemToMove);

      set({ collection: { ...collection, items: updatedItems } });
    },

    updateCollectionMeta: (name?: string, description?: string) => {
      const current = get().collection;
      window.electronAPI.logAction(
        `Atualizando coleção: ${current.name}, para: ${name || current.name}`
      );
      set((state) => ({
        collection: {
          ...state.collection,
          name: name !== undefined ? name : state.collection.name,
          description: description !== undefined ? description : state.collection.description,
        },
      }));
    },

    updateEnvironments: (environments) => {
      set((state) => ({
        collection: { ...state.collection, environments },
      }));
    },

    setActiveEnvironment: (id) => {
      const env = get().collection.environments.find((e) => e.id === id);
      if (env) window.electronAPI.logAction(`Ativando ambiente: ${env.name}`);
      set((state) => ({
        collection: { ...state.collection, activeEnvironmentId: id },
      }));
    },

    addEnvironment: (name: string = "Novo Ambiente") => {
      window.electronAPI.logAction(`Adicionando novo ambiente: ${name}`);
      const newEnv = {
        id: `env_${Date.now()}`,
        name: name,
        variables: [],
      };
      set((state) => ({
        collection: {
          ...state.collection,
          environments: [...state.collection.environments, newEnv],
        },
      }));
      return newEnv.id;
    },

    deleteEnvironment: (id: string) => {
      set((state) => {
        const newEnvs = state.collection.environments.filter((e) => {
          if (e.id === id) {
            window.electronAPI.logAction(`Removendo ambiente: ${e.name}`);
          }
          return e.id !== id;
        });
        let newActiveId = state.collection.activeEnvironmentId;
        if (newActiveId === id) {
          newActiveId = newEnvs.length > 0 ? newEnvs[0].id : null;
        }
        return {
          collection: {
            ...state.collection,
            environments: newEnvs,
            activeEnvironmentId: newActiveId,
          },
        };
      });
    },

    updateEnvironmentName: (id: string, name: string) => {
      if (!envInitialNames[id]) {
        const env = get().collection.environments.find((e) => e.id === id);
        envInitialNames[id] = env ? env.name : "";
      }

      if (envUpdateTimeouts[id]) clearTimeout(envUpdateTimeouts[id]);

      envUpdateTimeouts[id] = setTimeout(() => {
        const initialName = envInitialNames[id];
        if (initialName !== name) {
          window.electronAPI.logAction(
            `Alterando o nome do ambiente: ${initialName}, para: ${name}`
          );
        }
        delete envUpdateTimeouts[id];
        delete envInitialNames[id];
      }, 1000);

      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => (e.id === id ? { ...e, name } : e)),
        },
      }));
    },

    addVariable: (envId: string) => {
      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            if (e.id === envId) {
              window.electronAPI.logAction(`Adicionando nova variável: ${e.name}`);
              return {
                ...e,
                variables: [
                  ...e.variables,
                  {
                    id: `var_${Date.now()}`,
                    key: "",
                    initialValue: "",
                    currentValue: "",
                    enabled: true,
                  },
                ],
              };
            }
            return e;
          }),
        },
      }));
    },

    updateVariable: (envId: string, varId: string, updates: Partial<Variable>) => {
      scheduleVariableLog(varId, "variável", () => {
        const env = get().collection.environments.find((e) => e.id === envId);
        return env?.variables.find((v) => v.id === varId);
      });

      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            if (e.id === envId) {
              return {
                ...e,
                variables: e.variables.map((v) => (v.id === varId ? { ...v, ...updates } : v)),
              };
            }
            return e;
          }),
        },
      }));
    },

    deleteVariable: (envId: string, varId: string) => {
      set((state) => ({
        collection: {
          ...state.collection,
          environments: state.collection.environments.map((e) => {
            if (e.id === envId) {
              return {
                ...e,
                variables: e.variables.filter((v) => {
                  if (v.id === varId) {
                    window.electronAPI.logAction(`Deletando variável: ${v.key} do ambiente: ${e.name}`);
                  }
                  return v.id !== varId;
                }),
              };
            }
            return e;
          }),
        },
      }));
    },

    addGlobalVariable: () => {
      window.electronAPI.logAction("Adicionando nova variável global");
      set((state) => ({
        globals: [
          ...(state.globals || []),
          {
            id: `global_${Date.now()}`,
            key: "",
            value: "",
            enabled: true,
          },
        ],
      }));
    },

    updateGlobalVariable: (id: string, updates: Partial<Variable>) => {
      scheduleVariableLog(id, "variável global", () => {
        return get().globals.find((v) => v.id === id);
      });

      set((state) => ({
        globals: (state.globals || []).map((v) => (v.id === id ? { ...v, ...updates } : v)),
      }));
    },

    deleteGlobalVariable: (id: string) => {
      set((state) => ({
        globals: (state.globals || []).filter((v) => {
          if (v.id === id) {
            window.electronAPI.logAction(`Deletando variável global: ${v.key}`);
          }
          return v.id !== id;
        }),
      }));
    },

    importEnvironment: (envData: any) => {
      if (!envData || !envData.variables) return;

      const newEnv = {
        id: `env_${Date.now()}`,
        name: `${envData.name || "Importado"}`,
        variables: envData.variables.map((v: any) => ({
          ...v,
          id: `var_${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      window.electronAPI.logAction(`Importando ambiente: ${envData.name}`);

      set((state) => ({
        collection: {
          ...state.collection,
          environments: [...state.collection.environments, newEnv],
        },
      }));
      return newEnv.id;
    },

    importGlobals: (globalsData: any) => {
      if (!Array.isArray(globalsData)) return;

      const newGlobals = globalsData.map((v: any) => ({
        ...v,
        id: `global_${Math.random().toString(36).substr(2, 9)}`,
      }));

      window.electronAPI.logAction(`Importando variáveis globais: ${globalsData.length}`);

      set((state) => ({
        globals: [...(state.globals || []), ...newGlobals],
      }));
    },

    getCollectionForExport: () => {
      const { collection } = get();
      return { ...collection };
    },

    resetCollection: () => {
      set({
        collection: {
          id: null,
          name: "",
          description: "",
          items: [],
          environments: [],
          activeEnvironmentId: null,
        },
        globals: [],
        tabs: [],
        activeTabId: null,
      });
    },
  };
};
