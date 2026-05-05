import { ipcRenderer } from "electron";
import { UserAPI } from "../../types/api/user";


export const userPreload: UserAPI = {
    // --- Usuário ---
  getUser: () => ipcRenderer.invoke("auth:get-user"),
  login: (email, password) => ipcRenderer.invoke("auth:login", { email, password }),
  logout: () => ipcRenderer.invoke("auth:logout"),
  register: (params) => ipcRenderer.invoke("auth:signup", params),
  socialLogin: (provider: 'google' | 'github') => ipcRenderer.invoke("auth:social-login", provider),
  onUserChanged: (callback) => {
    const subscription = (_event: any, user: any) => callback(user);
    ipcRenderer.on("user-changed", subscription);
    return () => {
      ipcRenderer.removeListener("user-changed", subscription);
    };
  },
}
