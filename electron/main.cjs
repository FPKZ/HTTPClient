const { app, dialog } = require("electron");
const path = require("path");
const log = require("electron-log");

log.info("--- APP STARTING ---");

// Configurações de hardware devem vir antes do ready
// app.disableHardwareAcceleration();
// app.commandLine.appendSwitch('disable-gpu-compositing'); // Alternativa se necessário

process.on("uncaughtException", (error) => {
  log.error("Uncaught Exception (Main):", error);
  dialog.showErrorBox(
    "Erro Fatal",
    `Ocorreu um erro inesperado:\n${error.message}\n${error.stack}`,
  );
  app.quit();
});

process.on("unhandledRejection", (reason, promise) => {
  log.error("Unhandled Rejection (Main):", reason);
  dialog.showErrorBox(
    "Promessa Rejeitada",
    `Razão: ${reason}\n${reason?.stack || ""}`,
  );
  app.quit();
});

// Core & Utils
const StorageProvider = require("./utils/storage-provider.cjs");
const LocalDbProvider = require("./utils/local-db-provider.cjs");
const PostmanTranslator = require("./core/postman-translator.cjs");
const { AxiosFormatter, HttpFormatter } = require("./core/formatters.cjs");
const MenuBuilder = require("./core/menu-builder.cjs");
const ContextMenuBuilder = require("./core/context-menu-builder.cjs");

// Services
const HistoryService = require("./services/history-service.cjs");
const NetworkService = require("./services/network-service.cjs");
const UserService = require("./services/user-service.cjs");
const SupabaseService = require("./services/supabase-service.cjs");
const SyncService = require("./services/sync-service.cjs");
const WindowManager = require("./services/window-manager.cjs");
const AutoUpdateService = require("./services/auto-update-service.cjs");
const IpcRouter = require("./services/ipc-router.cjs");
const ExportService = require("./services/export-service.cjs");
const DialogReact = require("./utils/dialog-react.cjs");
const actionLogger = require("./utils/action-logger.cjs");

// Setup Global Constants
const isDev = !app.isPackaged;
const preloadPath = path.join(__dirname, "preload.cjs");
const userDataPath = app.getPath("userData");

isDev ? actionLogger.logClear() : null;

// 1. Instanciar Provedores e Conversores (Infra e Core)
const storage = new StorageProvider(userDataPath);
const dbProvider = new LocalDbProvider(userDataPath);
const translator = new PostmanTranslator();
const axiosFormatter = new AxiosFormatter();
const httpFormatter = new HttpFormatter();
const exportService = new ExportService(storage);

// 2. Instanciar Serviços de Negócio
const supabaseService = new SupabaseService(userDataPath);
const userService = new UserService(supabaseService, dbProvider);
const historyService = new HistoryService(storage, dbProvider, userService);
const networkService = new NetworkService();
const syncService = new SyncService(dbProvider, supabaseService);
const windowManager = new WindowManager(isDev, preloadPath, actionLogger);

// Inicializa a sessão do usuário caso exista cache local / token válido
userService.initSession().catch(err => console.error("Erro ao inicializar sessão:", err));

const autoUpdateService = new AutoUpdateService(isDev, actionLogger);
const menuBuilder = new MenuBuilder(windowManager, isDev);
const dialogReact = new DialogReact(windowManager);
const contextMenuBuilder = new ContextMenuBuilder(windowManager, isDev);
global.contextMenuBuilder = contextMenuBuilder;

// 3. Orquestrar Inicialização do IpcRouter
const ipcRouter = new IpcRouter(
  windowManager,
  historyService,
  translator,
  { axios: axiosFormatter, http: httpFormatter },
  networkService,
  exportService,
  dialogReact,
  actionLogger,
  userService,
);

// app.disableHardwareAcceleration();
// --- Lifecycle do App ---

app.whenReady().then(() => {
  // Inicializa o roteamento de mensagens IPC
  ipcRouter.register();

  // Inicializa o menu nativo
  menuBuilder.build();

  // Inicializa o menu de contexto
  contextMenuBuilder.build();

  // Monitora falhas no processo de renderização (comum no Windows com drivers de vídeo)
  app.on("render-process-gone", (event, webContents, details) => {
    log.error("Render process gone:", details.reason, details.exitCode);
    if (
      details.reason === "crashed" ||
      details.reason === "gpu-process-crashed"
    ) {
      dialog.showErrorBox(
        "Erro de Interface",
        `A interface do app parou de responder (${details.reason}). Tente reiniciar o aplicativo.`,
      );
    }
  });

  log.info("App Ready. Starting Window Sequence...");
  actionLogger.log("Iniciando App...");
  // Inicializa o fluxo de atualização (que depois lança o app principal)
  // dialog.showMessageBox({ message: '1. App Ready. Checking updates...' }); // Debug
  try{
    // actionLogger.log("Inicia o fluxo de atualização");
    windowManager.createUpdateWindow();
  
    // Timeout de segurança global para garantir que o app abra
    const launchTimer = setTimeout(() => {
      windowManager.createMainWindow();
    }, 10000); // 10s se o auto-update travar
  
    // Action Logger Window (apenas em dev ou quando solicitado, mas aqui vamos deixar fixo para teste)
    // if (isDev) {
    //     windowManager.createActionLoggerWindow();
    // }
  
    autoUpdateService.init(windowManager, () => {
      clearTimeout(launchTimer);
      // dialog.showMessageBox({ message: '2. Launching Main Window...' }); // Debug
      actionLogger.log("Iniciando Sistema");
      
      // Inicia Rotina de Sincronização Local-First
      syncService.startBackgroundSync(30000); // 30s
      
      windowManager.createMainWindow();
    });
  } catch (error) {
    log.error("Erro ao iniciar o fluxo de atualização:", error);
    dialog.showErrorBox(
      "Erro ao iniciar o fluxo de atualização",
      error.message,
    );
    actionLogger.log("Erro ao iniciar o App: " + error.message);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (windowManager.getMainWindow() === null) {
    windowManager.createMainWindow();
  }
});
