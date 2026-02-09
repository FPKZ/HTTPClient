import { create } from "zustand";


const useInterfaceStore = create((set) => ({

   responseIsOpen: true,
   setResponseIsOpen: () => set((state) => ({ responseIsOpen: !state.responseIsOpen })),

   sideBarIsOpen: true,
   setSideBarIsOpen: () => set((state) => ({ sideBarIsOpen: !state.sideBarIsOpen })),

   codeSnipersIsOpen: false,
   setCodeSnipersIsOpen: () => set((state) => ({ codeSnipersIsOpen: !state.codeSnipersIsOpen })),


}))

export default useInterfaceStore