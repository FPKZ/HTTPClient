const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const converter = require('./converter-logic.cjs');

// 'app.isPackaged' returns true if the app is bundled (production), false otherwise (dev).
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 500,
    minHeight: 600,
    frame: false, // Custom TitleBar
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.removeMenu();

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Window Controls
  ipcMain.on("minimize", () => win.minimize());
  ipcMain.on("maximize", () => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on("close", () => win.close());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Converter Logic Integration ---

ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle('dialog:saveLocation', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Onde salvar os arquivos convertidos?',
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.on('start-conversion', async (event, { inputPath, outputPath, isFile }) => {
  try {
    const sender = event.sender;
    sender.send('log', `🔍 Iniciando processamento de: ${inputPath}`);
    
    const finalOutputDir = outputPath || (isFile ? path.dirname(inputPath) : inputPath);

    let filesToProcess = [];

    if (isFile) {
      filesToProcess = [inputPath];
    } else {
      filesToProcess = converter.findJsonFiles(inputPath);
    }

    if (filesToProcess.length === 0) {
      sender.send('log', '⚠️ Nenhuma coleção Postman encontrada.');
      sender.send('conversion-finished', { success: false });
      return;
    }

    sender.send('log', `📦 Encontrados ${filesToProcess.length} arquivos.`);

    let successCount = 0;
    
    for (const file of filesToProcess) {
      try {
        const postmanContent = fs.readFileSync(file, 'utf8');
        const postmanCollection = JSON.parse(postmanContent);
        const collectionName = postmanCollection.info?.name || "Collection";
        
        const structure = converter.processItems(postmanCollection.item);
        
        const generatedFiles = converter.saveHttpFiles(structure, finalOutputDir, collectionName);
        
        sender.send('log', `✅ Convertido: ${path.basename(file)} -> ${generatedFiles.length} arquivos .http gerados`);
        successCount++;
      } catch (err) {
        sender.send('log', `❌ Erro em ${path.basename(file)}: ${err.message}`);
      }
    }

    sender.send('log', '--- Fim ---');
    sender.send('conversion-finished', { success: true, count: successCount });

  } catch (error) {
    event.sender.send('log', `❌ Erro Crítico: ${error.message}`);
  }
});
