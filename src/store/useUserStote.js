import { create } from "zustand";

/**
 * Estado do Usuario
 */

const useUserStore = create((set) => ({
    user: null,
    setUser: () => set({
        user: window.electronAPI.getUser()
    }),
    clearUser: () => set({ user: null }),
}));

export default useUserStore;