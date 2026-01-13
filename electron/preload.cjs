const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startDownload: () => ipcRenderer.send("start-download"),

  ipcRenderer: {
    on(channel, func) {
      const validChannels = [
        "update-available",
        "download-progress",
        "update-downloaded",
        "navigate-to",
        "check-for-updates",
      ];

      if (validChannels.includes(channel)) {
        const subscription = (event, ...args) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
      }
    },
  },

  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
  forceClose: () => ipcRenderer.send("force-close"),
  selectFolder: () => ipcRenderer.invoke("dialog:openDirectory"),
  selectFile: () => ipcRenderer.invoke("dialog:openFile"),
  selectSaveLocation: () => ipcRenderer.invoke("dialog:saveLocation"),
  startConversion: (data) => ipcRenderer.send("start-conversion", data),
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
  request: (data) => ipcRenderer.invoke("request", data),

  openMenu: () => ipcRenderer.send("open-menu"),
  onMenuAction: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on("menu-action", subscription);
    return () => ipcRenderer.removeListener("menu-action", subscription);
  },
  onContextMenuAction: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on("context-menu-action", subscription);
    return () => ipcRenderer.removeListener("context-menu-action", subscription);
  },
  
  newFile: () => ipcRenderer.send("new-file"),

  saveFile: (data) => ipcRenderer.invoke("save-file", data),

  getFilePath: (file) => webUtils.getPathForFile(file),

  getHistory: () => ipcRenderer.invoke("get-history"),
  saveHistory: (data) => ipcRenderer.invoke("save-history", data),
  loadCollection: (fileName) => ipcRenderer.invoke("load-collection", fileName),
  deleteHistoryItem: (id) => ipcRenderer.invoke("delete-history-item", id),

  showFolderContextMenu: (params) => ipcRenderer.send("show-folder-context-menu", params),
  showRootContextMenu: () => ipcRenderer.send("show-root-context-menu"),
  onRequestSaveSession: (callback) => {
    const subscription = () => callback();
    ipcRenderer.on("request-save-session", subscription);
    return () =>
      ipcRenderer.removeListener("request-save-session", subscription);
  },
  saveAndQuit: (data) => ipcRenderer.send("save-and-quit", data),
  confirm: (message) => ipcRenderer.invoke("dialog:confirm", message),
});
