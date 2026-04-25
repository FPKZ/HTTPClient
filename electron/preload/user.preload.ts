import { ipcRenderer } from "electron";
import { UserAPI } from "../../types/api/user";
import { User } from "../../types/entities/user";


export const userPreload: UserAPI = {
    // --- Usuário ---
  getUser: (): Promise<User> => ipcRenderer.invoke("get-user"),
  login: (email, password) => ipcRenderer.invoke("login", { email, password }),
  logout: () => ipcRenderer.invoke("logout"),
  register: (email, password) => ipcRenderer.invoke("register", { email, password }),
  update: (user) => ipcRenderer.invoke("update", { user }),
  onUserChangerd: (callback) => {
    const subscription = (_event: any, user: User) => callback(user);
    ipcRenderer.on("user-changed", subscription);
    return () => {
      ipcRenderer.removeListener("user-changed", subscription);
    };
  },
}
