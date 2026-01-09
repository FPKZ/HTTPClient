const { app, dialog } = require("electron");
const path = require("path");

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  dialog.showErrorBox(
    "Erro Fatal",
    `Ocorreu um erro inesperado:\n${error.message}\n${error.stack}`
  );
  app.quit();
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  dialog.showErrorBox(
    "Promessa Rejeitada",
    `Razão: ${reason}\n${reason?.stack || ""}`
  );
  app.quit();
});

// Core & Utils
const StorageProvider = require("./utils/storage-provider.cjs");
const PostmanTranslator = require("./core/postman-translator.cjs");
const { AxiosFormatter, HttpFormatter } = require("./core/formatters.cjs");
const MenuBuilder = require("./core/menu-builder.cjs");
const ContextMenuBuilder = require("./core/context-menu-builder.cjs");

// Services
const HistoryService = require("./services/history-service.cjs");
const NetworkService = require("./services/network-service.cjs");
const WindowManager = require("./services/window-manager.cjs");
const AutoUpdateService = require("./services/auto-update-service.cjs");
const IpcRouter = require("./services/ipc-router.cjs");
const ExportService = require("./services/export-service.cjs");

// Setup Global Constants
const isDev = !app.isPackaged;
const preloadPath = path.join(__dirname, "preload.cjs");
const userDataPath = app.getPath("userData");

// 1. Instanciar Provedores e Conversores (Infra e Core)
const storage = new StorageProvider(userDataPath);
const translator = new PostmanTranslator();
const axiosFormatter = new AxiosFormatter();
const httpFormatter = new HttpFormatter();
const exportService = new ExportService(storage);

// 2. Instanciar Serviços de Negócio
const historyService = new HistoryService(storage);
const networkService = new NetworkService();
const windowManager = new WindowManager(isDev, preloadPath);
const autoUpdateService = new AutoUpdateService(isDev);
const menuBuilder = new MenuBuilder(windowManager, isDev);
const contextMenuBuilder = new ContextMenuBuilder(windowManager, isDev);

// 3. Orquestrar Inicialização do IpcRouter
const ipcRouter = new IpcRouter(
  windowManager,
  historyService,
  translator,
  { axios: axiosFormatter, http: httpFormatter },
  networkService,
  exportService
);

// --- Lifecycle do App ---

app.whenReady().then(() => {
  // Inicializa o roteamento de mensagens IPC
  ipcRouter.register();

  // Inicializa o menu nativo
  menuBuilder.build();

  // Inicializa o menu de contexto
  contextMenuBuilder.build();

  // Inicializa o fluxo de atualização (que depois lança o app principal)
  // dialog.showMessageBox({ message: '1. App Ready. Checking updates...' }); // Debug
  windowManager.createUpdateWindow();

  // Timeout de segurança global para garantir que o app abra
  const launchTimer = setTimeout(() => {
    windowManager.createMainWindow();
  }, 10000); // 10s se o auto-update travar

  autoUpdateService.init(windowManager, () => {
    clearTimeout(launchTimer);
    // dialog.showMessageBox({ message: '2. Launching Main Window...' }); // Debug
    windowManager.createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (windowManager.getMainWindow() === null) {
    windowManager.createMainWindow();
  }
});
