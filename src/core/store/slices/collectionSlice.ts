import { StateCreator } from "zustand";
import * as utils from "@/utils/collectionUtils";
import { CollectionSlice, Variable } from "../../../../types/store";
import useInterfaceStore from "../useInterfaceStore";

// Importação lazy para evitar dependência circular com useTabStore
const getTabStore = () => import("../useTabStore").then((m) => m.default);

const setActiveSidebar = useInterfaceStore.getState().setSidebarIsOpenExplicit


/**
 * collectionSlice.ts
 * Gerenciamento do estado da coleção e sincronização com abas.
 */

export const createCollectionSlice: StateCreator<CollectionSlice, [], [], CollectionSlice> = (set, get) => {
  const envUpdateTimeouts: Record<string, NodeJS.Timeout> = {};
  const envInitialNames: Record<string, string> = {};
  const varUpdateTimeouts: Record<string, NodeJS.Timeout> = {};
  const varInitialStates: Record<string, Partial<Variable>> = {};

  const saveCollectionState = () => {
    const { collection } = get();
    if (collection.id && window.electronAPI?.saveHistory) {
      window.electronAPI.saveHistory({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        items: collection.items,
        environments: collection.environments,
        activeEnvironmentId: collection.activeEnvironmentId
      }).catch((err) =>
        console.error("[CollectionSlice] Erro no auto-salvamento no SQLite:", err)
      );
    }
  };

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

    loadCollection: async (data: any, skipSaveHistory = false) => {
      const newCollectionId = data?.id || `coll_${Date.now()}`;

      // 1. Evita abrir a mesma coleção em janelas separadas
      if (window.electronAPI?.checkCollectionOpen) {
        const isOpen = await window.electronAPI.checkCollectionOpen(newCollectionId);
        if (isOpen) {
          alert("Esta coleção já está aberta em outra janela.");
          return;
        }
      }

      const tabStore = await getTabStore();
      const currentCollectionId = get().collection.id;
      if (currentCollectionId) {
        tabStore.getState().saveTabsState(currentCollectionId);
      }

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
      if (!skipSaveHistory && window.electronAPI?.saveHistory) {
        window.electronAPI.saveHistory({
          id: newCollectionId,
          name,
          description,
          items: rawItems,
          environments,
          activeEnvironmentId
        }).catch((err) => console.error("Erro ao pré-salvar coleção carregada:", err));
      }

      const cleanItems = utils.normalizeItems(rawItems);

      if (window.electronAPI?.logAction) {
        window.electronAPI.logAction("Coleção carregada: " + name);
      }

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

      // 2. Notifica o Electron Main de que esta coleção está ativa nesta janela
      if (window.electronAPI?.setActiveCollection) {
        window.electronAPI.setActiveCollection(newCollectionId);
      }

      setActiveSidebar(true)
      if (newCollectionId) {
        tabStore.getState().restoreTabsState(newCollectionId);
      } else {
        tabStore.setState({
          tabs: [],
          activeTabId: null,
        });
      }
    },

    applyCreateItem: (entity, data) => {
      const { collection } = get();
      const parentId = entity === "folder" ? data.parentId : data.folderId;
      const updatedItems = utils.addItemToTree(collection.items, parentId, data);
      set({ collection: { ...collection, items: updatedItems } });
    },

    applyUpdateItem: (entity, id, data) => {
      const { collection } = get();
      const updatedItems = utils.updateItemInTree(collection.items, id, data);
      set({ collection: { ...collection, items: updatedItems } });

      if (entity === "route" && data.name) {
        getTabStore().then((tabStore) => {
          const tabs = tabStore.getState().tabs;
          tabStore.setState({
            tabs: tabs.map((tab) =>
              tab.screenKey === id ? { ...tab, title: data.name } : tab
            ),
          });
        });
      }
    },

    applyDeleteItem: (entity, id) => {
      const { collection } = get();
      const itemToDelete = utils.findItemById(collection.items, id);
      if (!itemToDelete) return;

      const idsToClose = utils.collectRouteIds(itemToDelete);
      const updatedItems = utils.removeItemFromTree(collection.items, id);

      set({ collection: { ...collection, items: updatedItems } });
      getTabStore().then((tabStore) => {
        const tabs = tabStore.getState().tabs;
        tabStore.setState({
          tabs: tabs.filter((tab) => !idsToClose.includes(tab.screenKey!)),
        });
      });
    },

    applyMoveItem: (entity, id, targetFolderId, orderIndex) => {
      const { collection } = get();
      const activePath = utils.findItemPath(collection.items, id);
      if (!activePath) return;

      const currentParentId = activePath.length > 1 
        ? utils.getItemByPath(collection.items, activePath.slice(0, -1))?.id || null 
        : null;
      const currentIndex = activePath[activePath.length - 1];

      if (currentParentId === targetFolderId && currentIndex === orderIndex) {
        return;
      }

      const itemToMove = utils.getItemByPath(collection.items, activePath);
      let updatedItems = utils.removeItemByPath(collection.items, activePath);
      
      if (targetFolderId) {
        const targetFolder = utils.findItemById(updatedItems, targetFolderId);
        if (targetFolder && targetFolder.type === "folder") {
          const children = targetFolder.items || [];
          children.splice(orderIndex, 0, itemToMove);
          updatedItems = utils.updateItemInTree(updatedItems, targetFolderId, { items: children });
        }
      } else {
        updatedItems.splice(orderIndex, 0, itemToMove);
      }

      set({ collection: { ...collection, items: updatedItems } });
    },

    saveTabToCollection: (id: string) => {
      const { collection } = get();
      // Acessa o tabStore de forma lazy para evitar dependência circular
      getTabStore().then((tabStore) => {
        const { tabs: currentTabs } = tabStore.getState();
        const tab = currentTabs.find((t: any) => t.id === id);
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
                ...get().collection,
                items: [...get().collection.items, newRoute as any],
              },
            });
            tabStore.setState({
              tabs: tabStore.getState().tabs.map((t: any) =>
                t.id === id ? { ...t, screenKey: newRoute.id, isDirty: false } : t
              ),
            });
          }).catch(console.error);
          return;
        }

        const updatedItems = utils.updateItemInTree(
          collection.items,
          tab.screenKey!,
          { name: tab.title, method: tab.method || "GET" }
        );
        window.electronAPI.logAction("Salvando alterações na rota: " + tab.title);
        window.electronAPI.saveRequestDetails(tab.screenKey, {
          name: tab.title,
          method: tab.method || "GET",
          url: tab.url || "",
          ...requestToSave,
          isDirty: false,
        }).then(() => {
          set({ collection: { ...get().collection, items: updatedItems } });
          tabStore.setState({
            tabs: tabStore.getState().tabs.map((t: any) =>
              t.id === id ? { ...t, isDirty: false } : t
            ),
          });
        }).catch(console.error);
      });
    },

    addRoute: (parentId: string | null = null, name: string = "Nova Rota", protocol: string = "http") => {
      const { collection } = get();
      if (!collection.id) return;

      const finalName = name === "Nova Rota" 
        ? (protocol === "websocket" ? "Novo WebSocket" : (protocol === "sse" ? "Nova Conexão SSE" : "Nova Rota"))
        : name;

      window.electronAPI.createRequest({
        collectionId: collection.id,
        folderId: parentId || null,
        name: finalName,
        protocol,
      }).catch((err) => console.error("Erro ao criar rota no SQLite:", err));
    },

    duplicateRoute: async (id: string) => {
      const { collection } = get();
      const route = utils.findItemById(collection.items, id);
      if (!route) return;

      const newRouteId = `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const name = route.name + " (Cópia)";

      window.electronAPI.duplicateRequest({
        id,
        newId: newRouteId,
        name,
      }).catch((err) => console.error("Erro ao duplicar rota no SQLite:", err));
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
      if (!clipboard || !collection.id) return;

      const newItem = utils.regenerateIds(clipboard);
      window.electronAPI.logAction(`Colando item: ${newItem.name}`);

      if (newItem.type === "route") {
        window.electronAPI.createRequest({
          collectionId: collection.id,
          folderId: targetId || null,
          name: newItem.name,
        }).catch((err) => console.error("Erro ao colar rota no SQLite:", err));
      } else {
        window.electronAPI.createFolder({
          collectionId: collection.id,
          parentId: targetId || null,
          name: newItem.name,
        }).catch((err) => console.error("Erro ao colar pasta no SQLite:", err));
      }

      set({ clipboard: null });
    },

    addFolder: (parentId: string | null = null, name: string = "Nova Pasta") => {
      const { collection } = get();
      if (!collection.id) return;

      window.electronAPI.createFolder({
        collectionId: collection.id,
        parentId: parentId || null,
        name: name || "Nova Pasta",
      }).catch((err) => console.error("Erro ao criar pasta no SQLite:", err));
    },

    deleteItem: (id: string) => {
      const { collection } = get();
      const itemToDelete = utils.findItemById(collection.items, id);
      if (!itemToDelete) return;

      window.electronAPI.logAction(`Deletando item: ${itemToDelete.name}`);

      if (itemToDelete.type === "folder") {
        window.electronAPI.deleteFolder({ id })
          .catch((err) => console.error("Erro ao deletar pasta no SQLite:", err));
      } else {
        window.electronAPI.deleteRequest({ id })
          .catch((err) => console.error("Erro ao deletar rota no SQLite:", err));
      }
    },

    renameItem: (id: string, newName: string) => {
      const { collection } = get();
      const item = utils.findItemById(collection.items, id);
      if (!item) return;

      window.electronAPI.renameItem({
        id,
        type: item.type as "folder" | "route",
        name: newName,
      }).catch((err) => console.error("Erro ao renomear item no SQLite:", err));
    },

    moveItemToFolder: (activeId: string, folderId: string | null) => {
      const { collection } = get();
      const item = utils.findItemById(collection.items, activeId);
      if (!item) return;

      // 1. Aplica a alteração localmente no Zustand de forma instantânea (otimista)
      get().applyMoveItem(item.type === "folder" ? "folder" : "route", activeId, folderId, 0);

      // 2. Grava no SQLite em segundo plano
      window.electronAPI.moveOrReorderItem({
        id: activeId,
        type: item.type as "folder" | "route",
        targetFolderId: folderId || null,
        orderIndex: 0,
      }).catch((err) => {
        console.error("Erro ao mover item no SQLite:", err);
        // Em caso de erro incomum, restaura o estado real do banco
        if (collection.id) {
          window.electronAPI.getCollectionById({ id: collection.id, source: "local" })
            .then((updatedCol) => { if (updatedCol) set({ collection: updatedCol }); });
        }
      });
    },

    reorderItems: (activeId: string, overId: string | null, isBelow = false) => {
      if (activeId === overId) return;
      const { collection } = get();

      const item = utils.findItemById(collection.items, activeId);
      if (!item) return;

      const activePath = utils.findItemPath(collection.items, activeId);
      const overPath = overId
        ? utils.findItemPath(collection.items, overId)
        : [collection.items.length];
      if (!activePath || !overPath) return;

      // Corrigido: targetFolderId deve vir do caminho do item destino (overPath) e não de origem (activePath)
      const targetFolderId = overId 
        ? (overPath.length > 1 ? utils.getItemByPath(collection.items, overPath.slice(0, -1))?.id || null : null)
        : null;
      
      let orderIndex = overPath[overPath.length - 1];
      if (isBelow) {
        orderIndex = orderIndex + 1;
      }

      // 1. Aplica a alteração localmente no Zustand de forma instantânea (otimista)
      get().applyMoveItem(item.type === "folder" ? "folder" : "route", activeId, targetFolderId, orderIndex);

      // 2. Grava no SQLite em segundo plano
      window.electronAPI.moveOrReorderItem({
        id: activeId,
        type: item.type as "folder" | "route",
        targetFolderId: targetFolderId || null,
        orderIndex,
      }).catch((err) => {
        console.error("Erro ao reordenar item no SQLite:", err);
        // Em caso de erro incomum, restaura o estado real do banco
        if (collection.id) {
          window.electronAPI.getCollectionById({ id: collection.id, source: "local" })
            .then((updatedCol) => { if (updatedCol) set({ collection: updatedCol }); });
        }
      });
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
      saveCollectionState();
    },

    updateEnvironments: (environments) => {
      set((state) => ({
        collection: { ...state.collection, environments },
      }));
      saveCollectionState();
    },

    setActiveEnvironment: (id) => {
      const env = get().collection.environments.find((e) => e.id === id);
      if (env) window.electronAPI.logAction(`Ativando ambiente: ${env.name}`);
      set((state) => ({
        collection: { ...state.collection, activeEnvironmentId: id },
      }));
      saveCollectionState();
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
      saveCollectionState();
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
      saveCollectionState();
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
      saveCollectionState();
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
      saveCollectionState();
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
      saveCollectionState();
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
      saveCollectionState();
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
      saveCollectionState();
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
      });
      getTabStore().then((tabStore) => {
        tabStore.setState({ tabs: [], activeTabId: null });
      });
    },
  };
};
