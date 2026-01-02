const { app } = require("electron");
const path = require("path");

// Core & Utils
const StorageProvider = require("./utils/storage-provider.cjs");
const PostmanTranslator = require("./core/postman-translator.cjs");
const { AxiosFormatter, HttpFormatter } = require("./core/formatters.cjs");
const MenuBuilder = require("./core/menu-builder.cjs");

// Services
const HistoryService = require("./services/history-service.cjs");
const NetworkService = require("./services/network-service.cjs");
const WindowManager = require("./services/window-manager.cjs");
const AutoUpdateService = require("./services/auto-update-service.cjs");
const IpcRouter = require("./services/ipc-router.cjs");

// Setup Global Constants
const isDev = !app.isPackaged;
const preloadPath = path.join(__dirname, "preload.cjs");
const userDataPath = app.getPath("userData");

// 1. Instanciar Provedores e Conversores (Infra e Core)
const storage = new StorageProvider(userDataPath);
const translator = new PostmanTranslator();
const axiosFormatter = new AxiosFormatter();
const httpFormatter = new HttpFormatter();

// 2. Instanciar Serviços de Negócio
const historyService = new HistoryService(storage);
const networkService = new NetworkService();
const windowManager = new WindowManager(isDev, preloadPath);
const autoUpdateService = new AutoUpdateService(isDev);
const menuBuilder = new MenuBuilder(windowManager);

// 3. Orquestrar Inicialização do IpcRouter
const ipcRouter = new IpcRouter(
  windowManager,
  historyService,
  translator,
  { axios: axiosFormatter, http: httpFormatter },
  networkService
);

// --- Lifecycle do App ---

app.whenReady().then(() => {
  // Inicializa o roteamento de mensagens IPC
  ipcRouter.register();

  // Inicializa o menu nativo
  menuBuilder.build();

  // Inicializa o fluxo de atualização (que depois lança o app principal)
  windowManager.createUpdateWindow();
  autoUpdateService.init(windowManager, () => {
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
