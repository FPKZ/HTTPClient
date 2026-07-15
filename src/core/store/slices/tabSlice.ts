import { StateCreator } from "zustand";
import { Tab, TabSlice } from "../../../../types/store";

/**
 * tabSlice.ts
 * Gerenciamento de abas editáveis.
 */
export const createTabSlice: StateCreator<TabSlice, [], [], TabSlice> = (set, get) => ({
  tabsByCollection: {},
  tabs: [],
  activeTabId: null,

  addTab: (screenKey: string, routeData: any) => {
    const { tabs } = get();
    const existingTab = tabs.find((tab) => tab.screenKey === screenKey);

    if (existingTab) {
      set({ activeTabId: existingTab.id });
      return;
    }

    if (screenKey) {
      window.electronAPI.getRequestDetails(screenKey)
        .then((details) => {
          const finalDetails = details || {
            method: routeData.method || "GET",
            url: "",
            headers: [],
            params: [],
            body: { mode: "none", content: "" },
          };
          const protocol = finalDetails.protocol || routeData.protocol || "http";
          const method = finalDetails.method || routeData.method || (protocol === "websocket" ? "WS" : "GET");
          const newTab: Tab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            screenKey,
            title: routeData.name || finalDetails.name || screenKey,
            protocol,
            connectionStatus: "disconnected",
            method,
            url: finalDetails.url || "",
            data: {
              id: routeData.id || screenKey,
              type: "route",
              name: routeData.name || finalDetails.name || "",
              description: routeData.description,
              request: {
                protocol,
                method,
                url: finalDetails.url || "",
                headers: finalDetails.headers || [],
                params: finalDetails.params || [],
                body: finalDetails.body || { mode: protocol === "websocket" ? "none" : "json", content: "" },
                auth: finalDetails.auth,
              },
            },
            isDirty: false,
            uiState: {
              activeSection: "headers",
              activeResponseView: "json",
              panelVerticalSize: "50",
              panelHorizontalSize: "30",
              logLimit: 250,
            },
            logs: [],
            isExecuting: false,
          };
 
          set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          }));
        })
        .catch((err) => {
          console.error("[tabSlice] Erro ao carregar detalhes para abrir aba:", err);
          const protocol = routeData.protocol || "http";
          const method = routeData.method || (protocol === "websocket" ? "WS" : "GET");
          const fallbackTab: Tab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            screenKey,
            title: routeData.name || screenKey,
            protocol,
            connectionStatus: "disconnected",
            method,
            url: "",
            data: {
              id: routeData.id || screenKey,
              type: "route",
              name: routeData.name || "",
              description: routeData.description,
              request: {
                protocol,
                method,
                url: "",
                headers: [],
                params: [],
                body: { mode: protocol === "websocket" ? "none" : "json", content: "" },
              },
            },
            isDirty: false,
            uiState: {
              activeSection: "headers",
              activeResponseView: "json",
              panelVerticalSize: "50",
              panelHorizontalSize: "30",
              logLimit: 250,
            },
            logs: [],
            isExecuting: false,
          };
 
          set((state) => ({
            tabs: [...state.tabs, fallbackTab],
            activeTabId: fallbackTab.id,
          }));
        });
    } else {
      const protocol = routeData.protocol || "http";
      const method = routeData.method || (protocol === "websocket" ? "WS" : "GET");
      const newTab: Tab = {
        id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        screenKey: null,
        title: routeData.name || "Nova Requisição",
        protocol,
        connectionStatus: "disconnected",
        method,
        url: routeData.url || "",
        data: {
          id: `temp_${Date.now()}`,
          type: "route",
          name: routeData.name || "",
          request: {
            protocol,
            method,
            url: routeData.url || "",
            headers: routeData.request?.headers || [],
            params: routeData.request?.params || [],
            body: routeData.request?.body || { mode: protocol === "websocket" ? "none" : "json", content: "" },
            auth: routeData.request?.auth,
          },
        },
        isDirty: true,
        uiState: {
          activeSection: "headers",
          activeResponseView: "json",
          panelVerticalSize: "50",
          panelHorizontalSize: "30",
          logLimit: 250,
        },
        logs: [],
        isExecuting: false,
      };
 
      set({
        tabs: [...tabs, newTab],
        activeTabId: newTab.id,
      });
    }
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
    const targetTab = tabs.find((t) => t.id === id);
    if (targetTab && (targetTab.protocol === "websocket" || targetTab.protocol === "sse")) {
      if (window.electronAPI?.connectionDisconnectAll) {
        window.electronAPI.connectionDisconnectAll(id);
      }
    }
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
          url: updatedRequest.url !== undefined ? updatedRequest.url : tab.url,
          method: updatedRequest.method !== undefined ? updatedRequest.method : tab.method,
          protocol: updatedRequest.protocol !== undefined ? updatedRequest.protocol : tab.protocol,
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

  appendTabLog: (id: string, log: any) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== id) return tab;
        const currentLogs = tab.logs || [];
        
        // Injeta id único e timestamp no log se não possuir
        const logWithId = {
          ...log,
          id: log.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: log.timestamp || Date.now(),
        };

        const limit = tab.uiState?.logLimit ?? 250;
        const newLogs = limit > 0 
          ? [...currentLogs, logWithId].slice(-limit)
          : [...currentLogs, logWithId];
        return { ...tab, logs: newLogs };
      }),
    }));
  },

  clearTabLogs: (id: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, logs: [] } : tab)),
    }));
  },

  updateTabConnectionStatus: (id: string, connectionStatus: "disconnected" | "connecting" | "connected") => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, connectionStatus } : tab)),
    }));
  },

  setTabExecuting: (id: string, isExecuting: boolean | string) => {
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

  saveTabsState: (collectionId: string) => {
    if (!collectionId) return;
    const { tabs, activeTabId, tabsByCollection } = get();
    set({
      tabsByCollection: {
        ...tabsByCollection,
        [collectionId]: { tabs, activeTabId },
      },
    });
  },

  restoreTabsState: (collectionId: string) => {
    if (!collectionId) {
      set({ tabs: [], activeTabId: null });
      return;
    }
    const { tabsByCollection } = get();
    const savedState = tabsByCollection[collectionId];
    if (savedState) {
      set({
        tabs: savedState.tabs,
        activeTabId: savedState.activeTabId,
      });

      // Inicia lazy loading das abas restauradas em background a partir do SQLite
      savedState.tabs.forEach((tab) => {
        if (tab.screenKey) {
          window.electronAPI.getRequestDetails(tab.screenKey).then((details) => {
            if (details) {
              set((state) => ({
                tabs: state.tabs.map((t) =>
                  t.id === tab.id
                    ? {
                        ...t,
                        url: details.url || t.url,
                        method: details.method || t.method,
                        data: {
                          ...t.data,
                          request: {
                            method: details.method || "GET",
                            url: details.url || "",
                            body: details.body || { mode: "none", content: "" },
                            headers: details.headers || [],
                            params: details.params || [],
                            auth: details.auth,
                          },
                        },
                        isDirty: false,
                      }
                    : t
                ),
              }));
            }
          }).catch(console.error);
        }
      });
    } else {
      set({
        tabs: [],
        activeTabId: null,
      });
    }
  },
});
