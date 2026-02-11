const { contextBridge, ipcRenderer, webUtils } = require("electron");

console.log("[Preload] Initializing...");

// Detecta o ambiente via argumento injetado pelo WindowManager
const isDev = process.argv.some((arg) => arg === "--is-dev=true");

contextBridge.exposeInMainWorld("electronAPI", {
  // --- Estado e Utilitários ---
  isDev: isDev,
  getFilePath: (file) => webUtils.getPathForFile(file),

  // --- Comunicação IPC Básica ---
  ipcRenderer: {
    on(channel, func) {
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
      ];
      if (validChannels.includes(channel)) {
        const subscription = (event, ...args) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
      }
    },
    send(channel, ...args) {
      ipcRenderer.send(channel, ...args);
    },
    invoke(channel, ...args) {
      return ipcRenderer.invoke(channel, ...args);
    },
  },

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
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on("log", subscription);
    return () => ipcRenderer.removeListener("log", subscription);
  },
  onFinished: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on("conversion-finished", subscription);
    return () =>
      ipcRenderer.removeListener("conversion-finished", subscription);
  },

  // --- Menus (App) ---
  openMenu: () => ipcRenderer.send("open-menu"),
  onMenuAction: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on("menu-action", subscription);
    return () => ipcRenderer.removeListener("menu-action", subscription);
  },

  // --- Gestão de Coleções e Histórico ---
  getHistory: () => ipcRenderer.invoke("get-history"),
  saveHistory: (data) => ipcRenderer.invoke("save-history", data),
  loadCollection: (fileName) => ipcRenderer.invoke("load-collection", fileName),
  deleteHistoryItem: (id) => ipcRenderer.invoke("delete-history-item", id),
  deleteAllHistory: () => ipcRenderer.invoke("delete-all-history"),
  onRequestSaveSession: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on("request-save-session", subscription);
    return () =>
      ipcRenderer.removeListener("request-save-session", subscription);
  },
  saveAndQuit: (data) => ipcRenderer.send("save-and-quit", data),

  // --- Rede ---
  conect: () => ipcRenderer.invoke("conect"),
  onNetworkStatus: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on("network-status", subscription);
    return () => ipcRenderer.removeListener("network-status", subscription);
  },

  // --- Clipboard (Native) ---
  copy: () => {
    // console.log("[Preload] Sending clipboard:copy");
    ipcRenderer.send("clipboard:copy");
  },
  cut: () => {
    // console.log("[Preload] Sending clipboard:cut");
    ipcRenderer.send("clipboard:cut");
  },
  paste: () => {
    // console.log("[Preload] Sending clipboard:paste");
    ipcRenderer.send("clipboard:paste");
  },
  selectAll: () => {
    // console.log("[Preload] Sending clipboard:selectAll");
    ipcRenderer.send("clipboard:selectAll");
  },
});
