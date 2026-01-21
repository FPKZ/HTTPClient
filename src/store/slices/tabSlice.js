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

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((tab) => tab.id === activeTabId) || null;
  },
});
