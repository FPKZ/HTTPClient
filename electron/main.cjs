const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const fs = require("fs");
const converter = require("./converter-logic.cjs");

// 'app.isPackaged' returns true if the app is bundled (production), false otherwise (dev).
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    name: "HTTPClient",
    icon: path.join(__dirname, "../assets/icon1.png"),
    width: 900,
    height: 720,
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
  

  // Menu Nativo
  const template = [
    {
      label: "Novo Arquivo",
      click: () => {
        win.webContents.reload();
      },
    },
    {
      label: "Arquivo",
      submenu: [
        {
          label: "Configurações",
          click: () => {
            win.webContents.send("menu-action", "open-settings");
          },
        },
        { type: "separator" },
        {
          label: "Sair",
          accelerator: "CmdOrCtrl+Q",
          role: "quit",
        },
      ],
    },
    {
      label: "Editar",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "Visualizar",
      submenu: [
        { role: "reload" },
        { role: "forcereload" },
        isDev && { role: "toggledevtools" },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  ipcMain.on("open-menu", () => {
    menu.popup({ window: win });
  });
}

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Eventos importantes
autoUpdater.on("checking-for-update", () => {
  log.info("🔍 Checando por atualizações...");
});

autoUpdater.on("update-available", (info) => {
  log.info("⬇️ Atualização disponível:", info);
});

autoUpdater.on("update-not-available", (info) => {
  log.info("✅ Nenhuma atualização disponível:", info);
});

autoUpdater.on("error", (err) => {
  log.error("❌ Erro na atualização:", err);
});

autoUpdater.on("download-progress", (progress) => {
  log.info(
    `📦 Velocidade de download: ${progress.bytesPerSecond} - ${progress.percent.toFixed(
      2
    )}%`
  );
});

autoUpdater.on("update-downloaded", (info) => {
  log.info("🔁 Atualização baixada:", info);
});

app.whenReady().then(() => {
  createWindow()

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

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

ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
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

ipcMain.handle("request", async (event, { url, method, headers, body }) => {
  const axios = require("axios");
  const FormData = require("form-data");
  const fs = require("fs");
  const sender = event.sender;

  let requestData = body;
  let requestHeaders = { ...headers };

  // Verifica se o corpo contém arquivos
  const hasFiles =
    body &&
    typeof body === "object" &&
    Object.values(body).some(
      (val) => val && typeof val === "object" && val.src && val.type === "file"
    );

  if (hasFiles) {
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (
        value &&
        typeof value === "object" &&
        value.src &&
        value.type === "file"
      ) {
        if (fs.existsSync(value.src)) {
          form.append(key, fs.createReadStream(value.src));
        }
      } else {
        // Se for um objeto que não é arquivo, enviamos como string JSON
        // Se for um valor simples, enviamos como está
        form.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : value
        );
      }
    }
    requestData = form;
    // Mescla os headers originais com os do FormData (importante para o boundary)
    requestHeaders = { ...requestHeaders, ...form.getHeaders() };
  }

  try {
    const response = await axios({
      method,
      url,
      headers: requestHeaders,
      data: requestData,
      responseType: "arraybuffer",
    });

    const contentType = response.headers["content-type"] || "";
    const isImage = contentType.startsWith("image/");

    let responseDataBody;
    if (isImage) {
      responseDataBody = Buffer.from(response.data).toString("base64");
    } else {
      responseDataBody = Buffer.from(response.data).toString("utf8");
      try {
        if (contentType.includes("application/json")) {
          responseDataBody = JSON.parse(responseDataBody);
        }
      } catch (e) {}
    }

    const responseData = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: responseDataBody,
      isImage,
      contentType,
    };

    sender.send("log", responseData);
    return responseData;
  } catch (error) {
    console.error("Erro na requisição:", error);

    let errorBody = error.message;
    if (error.response?.data) {
      errorBody = Buffer.from(error.response.data).toString("utf8");
      try {
        if (
          error.response.headers["content-type"]?.includes("application/json")
        ) {
          errorBody = JSON.parse(errorBody);
        }
      } catch (e) {}
    }

    const errorData = {
      status: error.response?.status || 500,
      statusText: error.response?.statusText || "Internal Server Error",
      headers: error.response?.headers || {},
      data: errorBody,
      isError: true,
    };

    sender.send("log", errorData);
    return errorData;
  }
});
