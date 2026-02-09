import { create } from "zustand";


const useInterfaceStore = create((set) => ({

   responseIsOpen: true,
   setResponseIsOpen: () => set((state) => ({ responseIsOpen: !state.responseIsOpen })),

   sideBarIsOpen: true,
   setSideBarIsOpen: () => set((state) => ({ sideBarIsOpen: !state.sideBarIsOpen })),

   codeSnippetsIsOpen: false,
   setCodeSnippetsIsOpen: () => set((state) => ({ codeSnippetsIsOpen: !state.codeSnippetsIsOpen })),


}))

export default useInterfaceStore