import { create } from "zustand";
import useTabStore from "./useTabStore";

const isActiveTab = () => {
  const activeTab = useTabStore.getState().getActiveTab();
  return !!activeTab;
};

type SidebarKey = "user" | "collections" | "workspaces" | null;

interface InterfaceState {
  sideBarIsOpen: boolean;
  setSideBarIsOpen: () => void;
  setSidebarIsOpenExplicit: (isClose: boolean) => void;
  activeSidebar: SidebarKey;
  setActiveSidebar: (side: SidebarKey) => void;
  responseIsOpen: boolean;
  setResponseIsOpen: () => void;
  codeSnippetsIsOpen: boolean;
  setCodeSnippetsIsOpen: () => void;
  isActiveTab: () => boolean;
}

const useInterfaceStore = create<InterfaceState>((set, get) => ({
  sideBarIsOpen: false,
  setSideBarIsOpen: () => set((state) => ({ sideBarIsOpen: !state.sideBarIsOpen })),
  setSidebarIsOpenExplicit: (isClose: boolean) => set(() => ({ sideBarIsOpen: isClose })),

  activeSidebar: "collections" as SidebarKey,
  setActiveSidebar: (side: SidebarKey) => set((state) => {
    // Clicando no botão que já está ativo → fecha o painel
    if (side === state.activeSidebar && state.sideBarIsOpen) {
      return { sideBarIsOpen: false, activeSidebar: side };
    }
    // Clicando em outro botão → abre o painel com o novo sidebar
    return { activeSidebar: side, sideBarIsOpen: true };
  }),

  responseIsOpen: true,
  setResponseIsOpen: () =>
    set((state) => ({ responseIsOpen: isActiveTab() ? !state.responseIsOpen : false })),

  codeSnippetsIsOpen: true,
  setCodeSnippetsIsOpen: () =>
    set((state) => ({ codeSnippetsIsOpen: isActiveTab() ? !state.codeSnippetsIsOpen : false })),

  isActiveTab: isActiveTab
}));

export default useInterfaceStore;
