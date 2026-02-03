/**
 * collectionSlice.js
 * Gerenciamento do estado da coleção e sincronização com abas.
 */
import * as utils from "../../utils/collectionUtils";

export const createCollectionSlice = (set, get) => ({
  collection: {
    id: null,
    name: "",
    description: "",
    items: [],
    environments: [
      {
        id: "env_default",
        name: "Desenvolvimento",
        variables: [],
      },
    ],
    activeEnvironmentId: "env_default",
  },
  globals: [],
  isDraggingDisabled: false,

  setDraggingDisabled: (disabled) => set({ isDraggingDisabled: disabled }),

  loadCollection: (data) => {
    const rawItems =
      data?.items ||
      data?.content?.items ||
      data?.routes ||
      data?.content?.routes ||
      [];
    const cleanItems = utils.normalizeItems(rawItems);

    let environments = data?.environments || [];
    let activeEnvironmentId = data?.activeEnvironmentId || null;

    // Migração: se environments for o formato antigo (array de variaveis direto)
    if (environments.length > 0 && !environments[0].variables) {
      environments = [
        {
          id: "env_migrated",
          name: "Importado",
          variables: environments.map((v) => ({
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

    if (environments.length === 0) {
      environments = [
        {
          id: "env_default",
          name: "Desenvolvimento",
          variables: [],
        },
      ];
      activeEnvironmentId = "env_default";
    }

    set({
      collection: {
        id: data?.id || null,
        name: data?.name || data?.collectionName || "Collection",
        description: data?.descricao || data?.description || "",
        items: cleanItems,
        environments,
        activeEnvironmentId,
      },
      tabs: [],
      activeTabId: null,
    });
  },

  saveTabToCollection: (id) => {
    const { tabs, collection } = get();
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;

    const routeExists = utils.findItemById(collection.items, tab.screenKey);

    if (!routeExists) {
      const newRoute = {
        ...tab.data,
        type: "route",
        id: tab.screenKey || `route_${Date.now()}`,
        name: tab.title,
      };
      set({
        collection: {
          ...collection,
          items: [...collection.items, newRoute],
        },
        tabs: tabs.map((t) =>
          t.id === id ? { ...t, screenKey: newRoute.id, isDirty: false } : t,
        ),
      });
      return;
    }

    const updatedItems = utils.updateItemInTree(
      collection.items,
      tab.screenKey,
      {
        ...tab.data,
        name: tab.title,
      },
    );

    set({
      collection: { ...collection, items: updatedItems },
      tabs: tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
    });
  },

  addRoute: (parentId = null, name = "Nova Rota") => {
    const { collection } = get();
    const newRoute = {
      id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: "route",
      name: name || "Nova Rota",
      request: {
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
      },
    };

    const updatedItems = utils.addItemToTree(
      collection.items,
      parentId,
      newRoute,
    );
    set({ collection: { ...collection, items: updatedItems } });
    get().addTab(newRoute.id, newRoute);
  },

  addFolder: (parentId = null, name = "Nova Pasta") => {
    const { collection } = get();
    const newFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: "folder",
      name: name || "Nova Pasta",
      items: [],
    };

    const updatedItems = utils.addItemToTree(
      collection.items,
      parentId,
      newFolder,
    );
    set({ collection: { ...collection, items: updatedItems } });
  },

  deleteItem: (id) => {
    const { collection, tabs } = get();
    const itemToDelete = utils.findItemById(collection.items, id);
    if (!itemToDelete) return;

    const idsToClose = utils.collectRouteIds(itemToDelete);
    const updatedItems = utils.removeItemFromTree(collection.items, id);

    set({
      collection: { ...collection, items: updatedItems },
      tabs: tabs.filter((tab) => !idsToClose.includes(tab.screenKey)),
    });
  },

  renameItem: (id, newName) => {
    const { collection, tabs } = get();
    const updatedItems = utils.updateItemInTree(collection.items, id, {
      name: newName,
    });

    set({
      collection: { ...collection, items: updatedItems },
      tabs: tabs.map((tab) =>
        tab.screenKey === id ? { ...tab, title: newName } : tab,
      ),
    });
  },

  moveItemToFolder: (activeId, folderId) => {
    const { collection } = get();
    if (activeId === folderId) return;

    const activePath = utils.findItemPath(collection.items, activeId);
    if (!activePath) return;

    const itemToMove = utils.getItemByPath(collection.items, activePath);
    let updatedItems = utils.removeItemByPath(collection.items, activePath);
    updatedItems = utils.addItemToTree(updatedItems, folderId, itemToMove);

    set({ collection: { ...collection, items: updatedItems } });
  },

  reorderItems: (activeId, overId) => {
    if (activeId === overId) return;
    const { collection } = get();

    const activePath = utils.findItemPath(collection.items, activeId);
    const overPath = overId
      ? utils.findItemPath(collection.items, overId)
      : [collection.items.length];
    if (!activePath) return;

    const itemToMove = utils.getItemByPath(collection.items, activePath);
    let updatedItems = utils.removeItemByPath(collection.items, activePath);
    updatedItems = utils.insertItemByPath(updatedItems, overPath, itemToMove);

    set({ collection: { ...collection, items: updatedItems } });
  },

  updateCollectionMeta: (name, description) => {
    set((state) => ({
      collection: {
        ...state.collection,
        name: name !== undefined ? name : state.collection.name,
        description:
          description !== undefined ? description : state.collection.description,
      },
    }));
  },

  updateEnvironments: (environments) => {
    set((state) => ({
      collection: { ...state.collection, environments },
    }));
  },

  setActiveEnvironment: (id) => {
    set((state) => ({
      collection: { ...state.collection, activeEnvironmentId: id },
    }));
  },

  addEnvironment: (name = "Novo Ambiente") => {
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

  deleteEnvironment: (id) => {
    set((state) => {
      const newEnvs = state.collection.environments.filter((e) => e.id !== id);
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

  updateEnvironmentName: (id, name) => {
    set((state) => ({
      collection: {
        ...state.collection,
        environments: state.collection.environments.map((e) =>
          e.id === id ? { ...e, name } : e,
        ),
      },
    }));
  },

  addVariable: (envId) => {
    set((state) => ({
      collection: {
        ...state.collection,
        environments: state.collection.environments.map((e) => {
          if (e.id === envId) {
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

  updateVariable: (envId, varId, updates) => {
    set((state) => ({
      collection: {
        ...state.collection,
        environments: state.collection.environments.map((e) => {
          if (e.id === envId) {
            return {
              ...e,
              variables: e.variables.map((v) =>
                v.id === varId ? { ...v, ...updates } : v,
              ),
            };
          }
          return e;
        }),
      },
    }));
  },

  deleteVariable: (envId, varId) => {
    set((state) => ({
      collection: {
        ...state.collection,
        environments: state.collection.environments.map((e) => {
          if (e.id === envId) {
            return {
              ...e,
              variables: e.variables.filter((v) => v.id !== varId),
            };
          }
          return e;
        }),
      },
    }));
  },

  addGlobalVariable: () => {
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

  updateGlobalVariable: (id, updates) => {
    set((state) => ({
      globals: (state.globals || []).map((v) =>
        v.id === id ? { ...v, ...updates } : v,
      ),
    }));
  },

  deleteGlobalVariable: (id) => {
    set((state) => ({
      globals: (state.globals || []).filter((v) => v.id !== id),
    }));
  },

  getCollectionForExport: () => {
    const { collection } = get();
    return { ...collection };
  },
});
