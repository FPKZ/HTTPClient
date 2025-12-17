const { contextBridge, ipcRenderer, webUtils } = require('electron'); // 1. Adicione webUtils aqui

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  selectSaveLocation: () => ipcRenderer.invoke('dialog:saveLocation'),
  startConversion: (data) => ipcRenderer.send('start-conversion', data),
  onLog: (callback) => ipcRenderer.on('log', (_event, value) => callback(value)),
  onFinished: (callback) => ipcRenderer.on('conversion-finished', (_event, value) => callback(value)),
  
  // 2. Adicione esta nova função:
  getFilePath: (file) => webUtils.getPathForFile(file)
});