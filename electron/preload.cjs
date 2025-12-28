const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
  
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  selectSaveLocation: () => ipcRenderer.invoke('dialog:saveLocation'),
  startConversion: (data) => ipcRenderer.send('start-conversion', data),
  onLog: (callback) => ipcRenderer.on('log', (_event, value) => callback(value)),
  onFinished: (callback) => ipcRenderer.on('conversion-finished', (_event, value) => callback(value)),
  request: (data) => ipcRenderer.invoke('request', data),

  openMenu: () => ipcRenderer.send('open-menu'),
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (_event, value) => callback(value)),
  
  newFile: () => ipcRenderer.send('new-file'),
  
  getFilePath: (file) => webUtils.getPathForFile(file)
});
