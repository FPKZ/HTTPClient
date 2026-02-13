import { create } from "zustand";
import useTabStore from "./useTabStore";

const isActiveTab = () => {
   const activeTab = useTabStore.getState().getActiveTab();
   return !!activeTab;
}

const useInterfaceStore = create((set) => ({

   sideBarIsOpen: true,
   setSideBarIsOpen: () => set((state) => ({ sideBarIsOpen: !state.sideBarIsOpen })),
   
   responseIsOpen: true,
   setResponseIsOpen: () => set((state) => ({ responseIsOpen: isActiveTab() ? !state.responseIsOpen : false })),

   codeSnippetsIsOpen: false,
   setCodeSnippetsIsOpen: () => set((state) => ({ codeSnippetsIsOpen: isActiveTab() ? !state.codeSnippetsIsOpen : false })),

}))

export default useInterfaceStore