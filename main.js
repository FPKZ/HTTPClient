const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const converter = require('./converter-logic'); // Importa seu script modificado

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // Descomente para debug
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Lógica de Conversão ---

// Handler: Selecionar Pasta (Input)
ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (canceled) return null;
  return filePaths[0];
});

// Handler: Selecionar Onde Salvar (Output)
ipcMain.handle('dialog:saveLocation', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Onde salvar os arquivos convertidos?',
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled) return null;
  return filePaths[0];
});

// Handler: Executar Conversão
ipcMain.on('start-conversion', async (event, { inputPath, outputPath, isFile }) => {
  try {
    const sender = event.sender;
    sender.send('log', `🔍 Iniciando processamento de: ${inputPath}`);
    
    // Se o usuário não escolheu output, usa o mesmo diretório da entrada
    const finalOutputDir = outputPath || (isFile ? path.dirname(inputPath) : inputPath);

    let filesToProcess = [];

    if (isFile) {
      filesToProcess = [inputPath];
    } else {
      // Usa a função do seu script para achar JSONs
      filesToProcess = converter.findJsonFiles(inputPath);
    }

    if (filesToProcess.length === 0) {
      sender.send('log', '⚠️ Nenhuma coleção Postman encontrada.');
      sender.send('conversion-finished', { success: false });
      return;
    }

    sender.send('log', `📦 Encontrados ${filesToProcess.length} arquivos.`);

    let successCount = 0;
    
    // Processamento
    for (const file of filesToProcess) {
      try {
        // Lemos o arquivo JSON
        const postmanContent = fs.readFileSync(file, 'utf8');
        const postmanCollection = JSON.parse(postmanContent);
        const collectionName = postmanCollection.info?.name || "Collection";
        
        // Processa estrutura
        const structure = converter.processItems(postmanCollection.item);
        
        // Salva usando a função do seu script, mas forçando o caminho de saída
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