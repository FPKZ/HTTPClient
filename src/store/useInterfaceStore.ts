import { create } from "zustand";
import useTabStore from "./useTabStore";

const isActiveTab = () => {
  const activeTab = useTabStore.getState().getActiveTab();
  return !!activeTab;
};

interface InterfaceState {
  sideBarIsOpen: boolean;
  setSideBarIsOpen: () => void;
  responseIsOpen: boolean;
  setResponseIsOpen: () => void;
  codeSnippetsIsOpen: boolean;
  setCodeSnippetsIsOpen: () => void;
}

const useInterfaceStore = create<InterfaceState>((set) => ({
  sideBarIsOpen: true,
  setSideBarIsOpen: () => set((state) => ({ sideBarIsOpen: !state.sideBarIsOpen })),

  responseIsOpen: true,
  setResponseIsOpen: () =>
    set((state) => ({ responseIsOpen: isActiveTab() ? !state.responseIsOpen : false })),

  codeSnippetsIsOpen: false,
  setCodeSnippetsIsOpen: () =>
    set((state) => ({ codeSnippetsIsOpen: isActiveTab() ? !state.codeSnippetsIsOpen : false })),
}));

export default useInterfaceStore;
