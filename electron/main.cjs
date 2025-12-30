const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");
const fs = require("fs");
const converter = require("./converter-logic.cjs");

// 'app.isPackaged' returns true if the app is bundled (production), false otherwise (dev).
const isDev = !app.isPackaged;

const getRouteURL = (route) => {
  if (isDev) {
    return `http://localhost:5173#${route}`;
  }
  // Em produção, usamos o caminho do arquivo + o hash da rota
  const indexPath = path.join(__dirname, "../dist/index.html");
  return `file://${indexPath}#${route}`;
};

let updateWindow;
let mainWindow;

function launchMainApp() {
  if (mainWindow) return; // Evita abrir múltiplas janelas
  createMainWindow();
  // A janela de update é fechada dentro do createMainWindow ou aqui
}

function createMainWindow() {
  if(mainWindow) return;

  mainWindow = new BrowserWindow({
    title: "HTTPClient",
    icon: path.join(__dirname, "../assets/icon1.png"),
    width: 1000,
    height: 600,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    center: true,
    resizable: true,
    frame: false, // Custom TitleBar
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(getRouteURL("/upload"));

  mainWindow.removeMenu();

  if(updateWindow) updateWindow.close();
  mainWindow.show();
  if(isDev) mainWindow.webContents.openDevTools();

  
  

  // Menu Nativo
  const template = [
    {
      label: "Novo Arquivo",
      click: () => {
        mainWindow.webContents.reload();
      },
    },
    { type: "separator" },
    {
      label: "Sair",
      accelerator: "CmdOrCtrl+Q",
      role: "quit",
    },
    // {
    //   label: "Arquivo",
    //   submenu: [
    //     {
    //       label: "Configurações",
    //       click: () => {
    //         mainWindow.webContents.send("menu-action", "open-settings");
    //       },
    //     },
    //     { type: "separator" },
    //     {
    //       label: "Sair",
    //       accelerator: "CmdOrCtrl+Q",
    //       role: "quit",
    //     },
    //   ],
    // },
    // {
    //   label: "Editar",
    //   submenu: [
    //     { role: "undo" },
    //     { role: "redo" },
    //     { type: "separator" },
    //     { role: "cut" },
    //     { role: "copy" },
    //     { role: "paste" },
    //   ],
    // },
    // {
    //   label: "Visualizar",
    //   submenu: [
    //     { role: "reload" },
    //     { role: "forcereload" },
    //     isDev && { role: "toggledevtools" },
    //     { type: "separator" },
    //     { role: "resetzoom" },
    //     { role: "zoomin" },
    //     { role: "zoomout" },
    //     { type: "separator" },
    //     { role: "togglefullscreen" },
    //   ],
    // },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  ipcMain.on("open-menu", () => {
    if (mainWindow) menu.popup({ window: mainWindow });
  });
}


function createUpdateWindow() {

  if(updateWindow) return;

  updateWindow = new BrowserWindow({
    width: 300,
    height: 400,
    resizable: false,
    center: true,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  updateWindow.loadURL(getRouteURL("/update"));

  // APENAS PARA TESTE
  // updateWindow.webContents.on('did-finish-load', () => {
  //   setTimeout(() => {
  //     updateWindow.webContents.send('update-available');
      
  //     // Simula uma barra de progresso subindo
  //     let percent = 0;
  //     const interval = setInterval(() => {
  //       percent += 5;
  //       updateWindow.webContents.send('download-progress', percent);
  //       if (percent >= 100) {
  //         clearInterval(interval);
  //         updateWindow.webContents.send('update-downloaded');
  //       }
  //     }, 10000);
  //   }, 3000); // Começa 3 segundos após carregar
  // });
  // updateWindow.toggleDevTools();

  if(!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    runUpdateSimulation();
  }

  autoUpdater.on("check-for-updates", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on("update-available", (info) => {
    updateWindow.webContents.send("update-available");
    log.info("⬇️ Atualização disponível:", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("✅ Nenhuma atualização disponível:", info);
    launchMainApp();
  });

  autoUpdater.on("download-progress", (progress) => {
    updateWindow.webContents.send("download-progress", progress.percent);
  });

  autoUpdater.on("update-downloaded", (info) => {
    updateWindow.webContents.send("update-downloaded");
    log.info("🔁 Atualização baixada:", info);

    // Aguarda 2 segundos para o usuário ver o status "ready" no React
    setTimeout(autoUpdater.quitAndInstall(false, true), 2000); 
    // O parâmetro (isSilent, isForceRunAfter) ajuda em alguns SOs
  });

  autoUpdater.on("error", (err) => {
    log.error("❌ Erro na atualização:", err);
    setTimeout(launchMainApp, 1500);
  });

  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = "info";

}

function runUpdateSimulation() {
  // Simulamos o ciclo de vida completo do autoUpdater de forma sequencial
  updateWindow.webContents.on('did-finish-load', () => {
      
      // 1. Simula: Update Encontrado
      setTimeout(() => {
          if (updateWindow?.isDestroyed()) return;
          updateWindow.webContents.send('update-available');
          
          // 2. Simula: Progresso de Download
          let percent = 0;
          const interval = setInterval(() => {
              percent += 10; // Aumentamos para 10% para o teste ser ágil
              
              if (updateWindow && !updateWindow.isDestroyed()) {
                  updateWindow.webContents.send('download-progress', percent);
                  
                  if (percent >= 100) {
                      clearInterval(interval);
                      // 3. Simula: Download Concluído
                      updateWindow.webContents.send('update-downloaded');
                      
                      // 4. Simula: O fechamento para instalação (ou transição)
                      setTimeout(() => {
                          launchMainApp(); 
                      }, 2000);
                  }
              } else {
                  clearInterval(interval);
              }
          }, 800); // 800ms por passo de progresso
      }, 2000); // Começa após 2 segundos
  });
}

// Window Controls
ipcMain.on("minimize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});
ipcMain.on("maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});
ipcMain.on("close", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

app.whenReady().then(createUpdateWindow);

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
