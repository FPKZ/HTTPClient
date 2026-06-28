import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createTabSlice } from "./slices/tabSlice";
import { TabSlice } from "../../../types/store";

/**
 * useTabStore
 * Store dedicado exclusivamente ao gerenciamento de abas editáveis e logs de requisições.
 */
const useTabStore = create<TabSlice>()(
  persist(
    (set, get, api) => ({
      ...createTabSlice(set, get, api),
    }),
    {
      name: "httpclient-tabs-storage",
      partialize: (state) => ({
        tabsByCollection: state.tabsByCollection,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);

export default useTabStore;
