const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const converter = require("./converter-logic.cjs");

// 'app.isPackaged' returns true if the app is bundled (production), false otherwise (dev).
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 700,
    minHeight: 600,
    frame: false, // Custom TitleBar
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.removeMenu();

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Window Controls
  ipcMain.on("minimize", () => win.minimize());
  ipcMain.on("maximize", () => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on("close", () => win.close());
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- Converter Logic Integration ---

ipcMain.handle("dialog:openDirectory", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle("dialog:saveLocation", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Onde salvar os arquivos convertidos?",
    properties: ["openDirectory", "createDirectory"],
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.on("start-conversion", async (event, { inputPath, isFile }) => {
  try {
    const sender = event.sender;
    sender.send("log", `🔍 Iniciando processamento de: ${inputPath}`);

    let filesToProcess = [];

    if (isFile) {
      filesToProcess = [inputPath];
    } else {
      filesToProcess = converter.findJsonFiles(inputPath);
    }

    if (filesToProcess.length === 0) {
      sender.send("log", "⚠️ Nenhuma coleção Postman encontrada.");
      sender.send("conversion-finished", { success: false });
      return;
    }

    sender.send("log", `📦 Encontrados ${filesToProcess.length} arquivos.`);

    let successCount = 0;
    const results = [];

    for (const file of filesToProcess) {
      try {
        const postmanContent = fs.readFileSync(file, "utf8");
        const postmanCollection = JSON.parse(postmanContent);
        const collectionName = postmanCollection.info?.name || "Collection";

        // 1. Converter para Objeto Axios (para o Frontend)
        const axiosCollection = converter.processCollectionToAxios(
          postmanCollection.item
        );

        // 2. Converter para Objeto HTTP Estruturado (para visualização)
        const httpCollection = converter.processCollectionToHttpObject(
          postmanCollection.item
        );

        results.push({
          name: collectionName,
          axios: axiosCollection,
          http: httpCollection,
          fileName: path.basename(file),
        });

        sender.send("log", `✅ Processado: ${path.basename(file)}`);
        successCount++;
      } catch (err) {
        sender.send("log", `❌ Erro em ${path.basename(file)}: ${err.message}`);
      }
    }

    sender.send("log", "--- Fim ---");
    // Envia os resultados processados de volta para o frontend
    sender.send("conversion-finished", {
      success: true,
      count: successCount,
      results,
    });
  } catch (error) {
    event.sender.send("log", `❌ Erro Crítico: ${error.message}`);
  }
});

// Handler para salvar arquivo .http (Exportação)
ipcMain.handle("save-file", async (event, { content, defaultPath }) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Salvar Arquivo .http",
      defaultPath: defaultPath || "collection.http",
      filters: [{ name: "HTTP Files", extensions: ["http"] }],
    });

    if (canceled || !filePath) return { success: false };

    // Se o conteúdo for um objeto (estrutura HTTP), converte para string única
    let fileContent = content;
    if (typeof content === "object") {
      fileContent = converter.flattenHttpObjectToString(content);
    }

    fs.writeFileSync(filePath, fileContent, "utf8");
    return { success: true, filePath };
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
    return { success: false, error: error.message };
  }
});
