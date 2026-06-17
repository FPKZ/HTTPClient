import { create } from "zustand";
import type { User } from "../../types/entities/user";

/**
 * Estado global do usuário autenticado.
 * Tipagem com o tipo User canônico compartilhado com o backend.
 */

interface UserState {
  user: User | null;
  setUser: (userData: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
