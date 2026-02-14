/**
 * tabSlice.js
 * Gerenciamento de abas editáveis.
 */
export const createTabSlice = (set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (screenKey, routeData) => {
    const { tabs } = get();
    const existingTab = tabs.find((tab) => tab.screenKey === screenKey);

    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return;
    }

    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      screenKey,
      title: routeData.name || screenKey,
      method: routeData.request?.method || "GET",
      url: routeData.request?.url || "",
      data: JSON.parse(JSON.stringify(routeData)),
      isDirty: false,
      uiState: {
        activeSection: "headers",
        activeResponseView: "json",
        panelVerticalSize: "50",
        panelHorizontalSize: "30",
      },
    };

    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    });
  },

  addBlankTab: (nome = "Nova Requisição") => {
    const title =
      typeof nome === "string"
        ? !nome
          ? "Nova Requisição"
          : nome
        : "Nova Requisição";
    const newTab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      screenKey: null,
      title,
      method: "GET",
      url: "",
      data: {
        type: "route",
        request: {
          method: "GET",
          url: "",
          headers: [],
          params: [],
          body: {
            mode: "json",
            content: [{ key: "", value: "", enabled: true }],
          },
        },
      },
      isDirty: true,
      uiState: {
        activeSection: "headers",
        activeResponseView: "json",
        panelVerticalSize: "50",
        panelHorizontalSize: "30",
      },
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter((tab) => tab.id !== id);
    let newActiveId = activeTabId;

    if (activeTabId === id) {
      newActiveId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId,
    });
  },

  updateTabData: (id, newData) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...newData, isDirty: true } : tab,
      ),
    }));
  },

  updateTabRequest: (id, sectionKey, fieldKey, value) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== id) return tab;

        const updatedRequest = { ...tab.data.request };

        if (fieldKey === null) {
          updatedRequest[sectionKey] = value;
        } else {
          const section = updatedRequest[sectionKey] || {};
          updatedRequest[sectionKey] = {
            ...section,
            [fieldKey]: value,
          };
        }

        return {
          ...tab,
          data: { ...tab.data, request: updatedRequest },
          url: updatedRequest.url || tab.url,
          method: updatedRequest.method || tab.method,
          isDirty: true,
        };
      }),
    }));
  },

  updateTabUiState: (id, partialUiState) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, uiState: { ...tab.uiState, ...partialUiState } }
          : tab,
      ),
    }));
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((tab) => tab.id === activeTabId) || null;
  },

  deleteActiveTab: () => {
    set({
      activeTabId: null,
    });
  },

  isTabDirty: (id) => {
    const { tabs } = get();
    const tab = tabs.find((t) => t.id === id);
    return tab ? tab.isDirty : false;
  },

  isRouteDirty: (screenKey) => {
    const { tabs } = get();
    return tabs.some((tab) => tab.screenKey === screenKey && tab.isDirty);
  },

  resetTabs: () => {
    set({
      tabs: [],
      activeTabId: null,
    });
  },
  reorderTabs: (oldIndex, newIndex) => {
    set((state) => {
      // Implementação manual de arrayMove para evitar dependência extra no slice se preferir,
      // mas como já temos dnd-kit, podemos importar ou fazer simples:
      const newTabs = [...state.tabs];
      const [movedItem] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, movedItem);

      return { tabs: newTabs };
    });
  },
});
