import { create } from "zustand";

/**
 * Estado do Usuario
 */

interface UserState {
  user: any | null;
  setUser: (userData: any) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
