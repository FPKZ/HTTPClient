import { contextBridge, ipcRenderer, webUtils } from "electron";
import { ElectronAPI } from "../src/types/electronAPI";

console.log("[Preload] Initializing...");

// Detecta o ambiente via argumento injetado pelo WindowManager
const isDev = process.argv.some((arg) => arg === "--is-dev=true");

const api: ElectronAPI = {
  // --- Estado e Utilitários ---
  isDev: isDev,
  getFilePath: (file: File) => webUtils.getPathForFile(file),

  // --- Comunicação IPC Básica ---
  ipcRenderer: {
    on(channel: string, func: (...args: any[]) => void) {
      const validChannels = [
        "update-available",
        "download-progress",
        "update-downloaded",
        "navigate-to",
        "check-for-updates",
        "show-dialog",
        "log-error",
        "new-action-log",
        "conect",
        "network-status",
        "log",
        "conversion-finished",
        "menu-action",
        "user-changed",
        "request-save-session"
      ];
      if (validChannels.includes(channel)) {
        const subscription = (_event: any, ...args: any[]) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
      return () => {};
    },
    send(channel: string, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    invoke(channel: string, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
  },

  teste: () => ipcRenderer.send("teste"),

  // --- Função de Log de Ações ---
  logAction: (action, user) => ipcRenderer.invoke("log-action", action, user),
  startActionLogger: () => ipcRenderer.send("start-action-logger"),
  stopActionLogger: () => ipcRenderer.send("stop-action-logger"),
  resizeWindow: (bounds) => ipcRenderer.send("resize-window", bounds),
  openActionLogger: () => ipcRenderer.send("open-action-logger"),

  // --- Controles de Janela ---
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
  closeAll: () => ipcRenderer.send("close-all"),
  forceClose: () => ipcRenderer.send("force-close"),
  toggleDevTools: () => ipcRenderer.send("toggle-dev-tools"),

  // --- Diálogos e Sistema de Arquivos ---
  selectFolder: () => ipcRenderer.invoke("dialog:openDirectory"),
  selectFile: (filters) => ipcRenderer.invoke("dialog:openFile", filters),
  selectSaveLocation: () => ipcRenderer.invoke("dialog:saveLocation"),
  saveFile: (data) => ipcRenderer.invoke("save-file", data),
  readJsonFile: (path) => ipcRenderer.invoke("read-json-file", path),
  exportHttp: (data) => ipcRenderer.invoke("export-http", data),
  confirm: (message) => ipcRenderer.invoke("dialog:confirm", message),
  newFile: () => ipcRenderer.send("new-file"),

  // --- Requisições e Conversão ---
  request: (data) => ipcRenderer.invoke("request", data),
  cancelRequest: (requestId) => ipcRenderer.send("cancel-request", requestId),
  startConversion: (data) => ipcRenderer.send("start-conversion", data),
  startDownload: () => ipcRenderer.send("start-download"),
  onLog: (callback) => {
    const subscription = (_event: any, value: any) => callback(value);
    ipcRenderer.on("log", subscription);
    return () => {
      ipcRenderer.removeListener("log", subscription);
    };
  },
  onFinished: (callback) => {
    const subscription = (_event: any, value: any) => callback(value);
    ipcRenderer.on("conversion-finished", subscription);
    return () => {
      ipcRenderer.removeListener("conversion-finished", subscription);
    };
  },

  // --- Menus (App) ---
  openMenu: () => ipcRenderer.send("open-menu"),
  onMenuAction: (callback) => {
    const subscription = (_event: any, value: any) => callback(value);
    ipcRenderer.on("menu-action", subscription);
    return () => {
      ipcRenderer.removeListener("menu-action", subscription);
    };
  },

  // --- Usuário ---
  getUser: () => ipcRenderer.invoke("get-user"),
  login: (email, password) => ipcRenderer.invoke("login", { email, password }),
  logout: () => ipcRenderer.invoke("logout"),
  register: (email, password) => ipcRenderer.invoke("register", { email, password }),
  update: (user) => ipcRenderer.invoke("update", { user }),
  onUserChangerd: (callback) => {
    const subscription = (_event: any, user: any) => callback(user);
    ipcRenderer.on("user-changed", subscription);
    return () => {
      ipcRenderer.removeListener("user-changed", subscription);
    };
  },

  // --- Gestão de Coleções e Histórico ---
  getHistory: () => ipcRenderer.invoke("get-history"),
  saveHistory: (data) => ipcRenderer.invoke("save-history", data),
  getCollectionById: (params) => ipcRenderer.invoke("get-collection-by-id", params),
  deleteHistoryItem: (id) => ipcRenderer.invoke("delete-history-item", id),
  deleteAllHistory: () => ipcRenderer.invoke("delete-all-history"),
  onRequestSaveSession: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on("request-save-session", subscription);
    return () => {
      ipcRenderer.removeListener("request-save-session", subscription);
    };
  },
  saveAndQuit: (data) => ipcRenderer.send("save-and-quit", data),

  // --- Rede ---
  conect: () => ipcRenderer.invoke("conect"),
  onNetworkStatus: (callback) => {
    const subscription = (_event: any, value: any) => callback(value);
    ipcRenderer.on("network-status", subscription);
    return () => {
      ipcRenderer.removeListener("network-status", subscription);
    };
  },

  // --- Clipboard (Native) ---
  copy: () => ipcRenderer.send("clipboard:copy"),
  cut: () => ipcRenderer.send("clipboard:cut"),
  paste: () => ipcRenderer.send("clipboard:paste"),
  selectAll: () => ipcRenderer.send("clipboard:selectAll"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
