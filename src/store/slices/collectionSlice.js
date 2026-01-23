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
    environments: [],
  },
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

    set({
      collection: {
        id: data?.id || null,
        name: data?.name || data?.collectionName || "Collection",
        description: data?.descricao || data?.description || "",
        items: cleanItems,
        environments: data?.environments || [],
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

  addEnvironment: () => {
    const { collection } = get();
    const newEnv = { name: "", value: "", enabled: true };
    set({
      collection: {
        ...collection,
        environments: [...(collection.environments || []), newEnv],
      },
    });
  },

  getCollectionForExport: () => {
    const { collection } = get();
    return { ...collection };
  },
});
