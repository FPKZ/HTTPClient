import { create } from "zustand";

/**
 * Estado do Usuario
 */

const useUserStore = create((set) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
    clearUser: () => set({ user: null }),
}));

export default useUserStore;