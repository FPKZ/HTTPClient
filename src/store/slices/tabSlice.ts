import { StateCreator } from "zustand";
import { Tab, TabSlice } from "../../types/store";

/**
 * tabSlice.ts
 * Gerenciamento de abas editáveis.
 */
export const createTabSlice: StateCreator<TabSlice, [], [], TabSlice> = (set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (screenKey: string, routeData: any) => {
    const { tabs } = get();
    const existingTab = tabs.find((tab) => tab.screenKey === screenKey);

    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return;
    }

    const newTab: Tab = {
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
      logs: [],
      isExecuting: false,
    };

    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    });
  },

  addBlankTab: (nome: string = "Nova Requisição") => {
    const title =
      typeof nome === "string"
        ? !nome
          ? "Nova Requisição"
          : nome
        : "Nova Requisição";

    const newTab: Tab = {
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
      logs: [],
      isExecuting: false,
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  setActiveTab: (id: string | null) => set({ activeTabId: id }),

  closeTab: (id: string) => {
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

  updateTabData: (id: string, newData: Partial<Tab>) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...newData, isDirty: true } : tab
      ),
    }));
  },

  updateTabRequest: (id: string, sectionKey: string, fieldKey: string | null, value: any) => {
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

  updateTabUiState: (id: string, partialUiState: any) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? { ...tab, uiState: { ...tab.uiState, ...partialUiState } }
          : tab
      ),
    }));
  },

  updateTabLogs: (id: string, logs: any[]) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, logs } : tab)),
    }));
  },

  setTabExecuting: (id: string, isExecuting: boolean) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, isExecuting } : tab
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

  isTabDirty: (id: string) => {
    const { tabs } = get();
    const tab = tabs.find((t) => t.id === id);
    return tab ? tab.isDirty : false;
  },

  isRouteDirty: (screenKey: string) => {
    const { tabs } = get();
    return tabs.some((tab) => tab.screenKey === screenKey && tab.isDirty);
  },

  resetTabs: () => {
    set({
      tabs: [],
      activeTabId: null,
    });
  },

  reorderTabs: (oldIndex: number, newIndex: number) => {
    set((state) => {
      const newTabs = [...state.tabs];
      const [movedItem] = newTabs.splice(oldIndex, 1);
      newTabs.splice(newIndex, 0, movedItem);

      return { tabs: newTabs };
    });
  },
});
