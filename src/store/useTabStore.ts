import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createTabSlice } from "./slices/tabSlice";
import { createCollectionSlice } from "./slices/collectionSlice";
import { TabSlice, CollectionSlice } from "../types/store";

/**
 * useTabStore
 * Store centralizado utilizando o Slice Pattern.
 */

type FullStore = TabSlice & CollectionSlice;

const useTabStore = create<FullStore>()(
  persist(
    (set, get, api) => ({
      ...createTabSlice(set, get, api),
      ...createCollectionSlice(set, get, api),
    }),
    {
      name: "httpclient-tabs-storage",
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        collection: state.collection,
        globals: state.globals,
      }),
    }
  )
);

export default useTabStore;
