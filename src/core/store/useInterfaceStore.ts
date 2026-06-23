import { create } from "zustand";
import useTabStore from "./useTabStore";

const isActiveTab = () => {
  const activeTab = useTabStore.getState().getActiveTab();
  return !!activeTab;
};

interface InterfaceState {
  sideBarIsOpen: boolean;
  setSideBarIsOpen: () => void;
  setSidebarIsOpenExplicit: (isClose: boolean) => void;
  responseIsOpen: boolean;
  setResponseIsOpen: () => void;
  codeSnippetsIsOpen: boolean;
  setCodeSnippetsIsOpen: () => void;
  isActiveTab: () => boolean;
}

const useInterfaceStore = create<InterfaceState>((set) => ({
  sideBarIsOpen: true,
  setSideBarIsOpen: () => set((state) => ({ sideBarIsOpen: !state.sideBarIsOpen })),
  setSidebarIsOpenExplicit: (isClose: boolean) => set((state) => ({sideBarIsOpen: isClose})),

  responseIsOpen: true,
  setResponseIsOpen: () =>
    set((state) => ({ responseIsOpen: isActiveTab() ? !state.responseIsOpen : false })),

  codeSnippetsIsOpen: true,
  setCodeSnippetsIsOpen: () =>
    set((state) => ({ codeSnippetsIsOpen: isActiveTab() ? !state.codeSnippetsIsOpen : false })),

  isActiveTab: isActiveTab
}));

export default useInterfaceStore;
