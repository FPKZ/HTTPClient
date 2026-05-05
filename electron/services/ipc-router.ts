import { ipcMain, dialog, net, BrowserWindow, Menu, WebContents } from "electron";
import fs from "fs";
import path from "path";
import log from "electron-log";
import WindowManager from "./window-manager";
import HistoryService from "./history-service";
import PostmanTranslator, { CollectionItem } from "../core/postman-translator";
import { AxiosFormatter, HttpFormatter } from "../core/formatters";
import NetworkService from "./network-service";
import ExportService from "./export-service";
import DialogReact from "../utils/dialog-react";
import UserService from "./user-service";

/**
 * IpcRouter
 * Centraliza o registro de todos os handlers IPC.
 * Segue o OCP ao permitir delegar chamadas para diferentes serviços sem poluir o main.
 */
class IpcRouter {
  private win: WindowManager;
  private history: HistoryService;
  private translator: PostmanTranslator;
  private formatters: { axios: AxiosFormatter; http: HttpFormatter };
  private network: NetworkService;
  private export: ExportService;
  private dialogReact: DialogReact;
  private actionLogger: any;
  private user: UserService;
  private activeRequests: Map<string, AbortController> = new Map();

  constructor(
    windowManager: WindowManager,
    historyService: HistoryService,
    translator: PostmanTranslator,
    formatters: { axios: AxiosFormatter; http: HttpFormatter },
    networkService: NetworkService,
    exportService: ExportService,
    dialogReact: DialogReact,
    actionLogger: any,
    userService: UserService,
  ) {
    this.win = windowManager;
    this.history = historyService;
    this.translator = translator;
    this.formatters = formatters;
    this.network = networkService;
    this.export = exportService;
    this.dialogReact = dialogReact;
    this.actionLogger = actionLogger;
    this.user = userService;
  }

  register(): void {
    ipcMain.on("teste", async () => {
      const options = {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'body': '{"tokenAcessoId":"d730e1cc29cf","tokenAcessoSenha":"GAwCtR{^7BriJ4h\'6q"}'
      };
  
      fetch('https://core-sistema-dev.peruibe.sp.gov.br/api/v1/auth/token', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
    });

    console.log("[IpcRouter] Registrando handlers IPC...");

    ipcMain.handle("conect", async () => {
      return net.isOnline();
    });

    // Monitoramento de Rede em Tempo Real
    let lastStatus = net.isOnline();
    setInterval(() => {
      const currentStatus = net.isOnline();
      if (currentStatus !== lastStatus) {
        lastStatus = currentStatus;
        const mainWin = this.win.getMainWindow();
        if (mainWin) {
          mainWin.webContents.send("network-status", currentStatus);
        }
      }
    }, 5000); // Verifica a cada 5 segundos

    // Logging
    ipcMain.handle("log-action", (_event, action: string, user: string | null) => {
      return this.actionLogger.log(action, user);
    });
    ipcMain.on("start-action-logger", () =>
      this.actionLogger.logRead(this.win.getActionLoggerWindow()),
    );
    ipcMain.on("stop-action-logger", () => this.actionLogger.logStop());

    ipcMain.on("resize-window", (event, bounds: { width: number; height: number; x: number; y: number }) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) win.setBounds(bounds);
    });

    ipcMain.on("open-action-logger", () => {
      this.win.createActionLoggerWindow();
    });

    // Window Controls
    ipcMain.on("minimize", () => this.win.minimize());
    ipcMain.on("maximize", () => this.win.maximize());
    ipcMain.on("close", () => this.win.close());
    ipcMain.on("close-all", () => this.win.closeAll());
    ipcMain.on("force-close", () => this.win.forceCloseApp());
    ipcMain.on("open-menu", () => {
      const mainWindow = this.win.getMainWindow();
      if (mainWindow) {
        const menu = Menu.getApplicationMenu();
        if (menu) menu.popup({ window: mainWindow });
      }
    });

    // Dialogs
    ipcMain.handle("dialog:openDirectory", async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle("dialog:openFile", async (_event, filters: any[]) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: filters || [],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle("dialog:saveLocation", async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Onde salvar os arquivos convertidos?",
        properties: ["openDirectory", "createDirectory"],
      });
      return canceled ? null : filePaths[0];
    });

    ipcMain.handle("dialog:confirm", async (_event, message: string) => {
      return this.dialogReact.showDialog({
        title: "Confirmação",
        description: message,
        options: [
          { label: "Cancelar", value: false, variant: "secondary" },
          { label: "Confirmar", value: true, variant: "primary" },
        ],
      });
    });

    // Conversion
    ipcMain.on("start-conversion", async (event, { inputPath, isFile }: { inputPath: string; isFile: boolean }) => {
      this._handleConversion(event.sender, inputPath, isFile);
    });

    // History
    ipcMain.handle("get-history", () => this.history.getHistory());
    ipcMain.handle("get-collection-by-id", (_event, { id, source }: { id: string; source: 'local' | 'supabase' }) =>
      this.history.getCollectionById(id)
    );
    ipcMain.on("save-and-quit", async (_event, collectionData: any) => {
      if (collectionData && collectionData.name) {
        await this.history.saveHistory(collectionData);
      }
      this.win.forceCloseApp();
    });

    ipcMain.handle("save-history", (_event, collectionData: any) => {
      if (collectionData && collectionData.name) {
        this.history.saveHistory(collectionData);
      }
    });

    ipcMain.handle("delete-history-item", (_event, id: string) =>
      this.history.deleteHistoryItem(id),
    );
    ipcMain.handle("delete-all-history", () => this.history.deleteAllHistory());

    // Network / Request
    ipcMain.handle("request", async (event, params: any) => {
      const requestId = params.requestId || Date.now().toString();
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);

      try {
        const result = await this.network.execute(
          { ...params, signal: controller.signal },
          (data: any) => event.sender.send("log", data),
        );
        return result;
      } finally {
        this.activeRequests.delete(requestId);
      }
    });

    ipcMain.on("cancel-request", (_event, requestId: string) => {
      const controller = this.activeRequests.get(requestId);
      if (controller) {
        controller.abort();
        this.activeRequests.delete(requestId);
        console.log(`[IpcRouter] Requisição ${requestId} cancelada.`);
      }
    });

    // User
    ipcMain.handle("auth:get-user", () => this.user.getCurrentUser());
    ipcMain.handle("auth:login", (_event, { email, password }) => this.user.signInWithEmail(email, password));
    ipcMain.handle("auth:logout", () => this.user.logout());
    ipcMain.handle("auth:signup", (_event, params) => this.user.signUpWithEmail(params));
    ipcMain.handle("auth:social-login", (_event, provider: 'google' | 'github') => this.user.signInWithOAuth(provider));
    // ipcMain.handle("update", (_event, { user }) => this.user.update(user));

    // Export
    ipcMain.handle("save-file", async (_event, { content, defaultPath }: { content: any; defaultPath: string }) => {
      return this._handleFileSave(content, defaultPath);
    });

    ipcMain.handle("read-json-file", async (_event, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, "utf8");
        return JSON.parse(content);
      } catch (error) {
        console.error("[IpcRouter] Erro ao ler JSON:", error);
        throw error;
      }
    });

    ipcMain.handle(
      "export-http",
      async (_event, { content: collectionData, defaultPath }: { content: any; defaultPath: string }) => {
        const formatter = this.formatters.http;
        const content = formatter.format(collectionData);
        return this._handleFileSave(content, defaultPath, [
          { name: "HTTP Files", extensions: ["http"] },
          { name: "Text Files", extensions: ["txt"] },
        ]);
      },
    );

    ipcMain.on("toggle-dev-tools", () => {
      this.win.toggleDevTools();
    });

    ipcMain.on("log-error", (_event, errorData: any) => {
      log.error("[Renderer Error]", errorData);
    });

    // Clipboard Actions (Native)
    ipcMain.on("clipboard:copy", (event) => {
      event.sender.copy();
    });

    ipcMain.on("clipboard:cut", (event) => {
      event.sender.cut();
    });

    ipcMain.on("clipboard:paste", (event) => {
      event.sender.paste();
    });

    ipcMain.on("clipboard:selectAll", (event) => {
      event.sender.selectAll();
    });
  }

  private async _handleConversion(sender: WebContents, inputPath: string, isFile: boolean): Promise<void> {
    sender.send("log", `🔍 Iniciando processamento de: ${inputPath}`);

    const filesToProcess = isFile
      ? [inputPath]
      : await this._scanForJsonCollections(inputPath);

    if (filesToProcess.length === 0) {
      sender.send(
        "log",
        "⚠️ Nenhum arquivo de coleção Postman válido encontrado.",
      );
      return;
    }
    const results = [];
    for (const file of filesToProcess) {
      await new Promise((resolve) => setImmediate(resolve));

      try {
        sender.send("log", `📄 Lendo arquivo: ${file}`);
        const content = await fs.promises.readFile(file, "utf8");
        const rawJson = JSON.parse(content);
        let internalModel;
        sender.send("log", `🔄 Traduzindo...`);

        if (rawJson.info && rawJson.item) {
          internalModel = this.translator.translate(rawJson);
          sender.send("log", `✅ Tradução OK: ${internalModel.name}`);
        } else if (rawJson.id && rawJson.items) {
          internalModel = rawJson;
          sender.send("log", `✅ Tradução OK: ${internalModel.name}`);
        } else {
          sender.send("log", `❌ Arquivo inválido`);
          continue;
        }

        results.push({
          raw: internalModel,
        });
        sender.send("log", `✅ Processado com sucesso: ${path.basename(file)}`);
      } catch (err: any) {
        console.error(`[handleConversion] Erro processando ${file}:`, err);
        sender.send("log", `❌ Erro em ${path.basename(file)}: ${err.message}`);
        return await this.dialogReact.showDialog({
          title: "Erro",
          description: `Erro ao processar ${file}: ${err.message}`,
          options: [{ label: "OK", value: true, variant: "primary" }],
        });
      }
    }

    sender.send("log", "--- Fim ---");
    sender.send("conversion-finished", {
      success: true,
      count: results.length,
      results,
    });
  }

  private async _scanForJsonCollections(dir: string): Promise<string[]> {
    let results: string[] = [];
    try {
      const list = await fs.promises.readdir(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = await fs.promises.stat(filePath);
        if (stat.isDirectory()) {
          if (file !== "node_modules") {
            const subResults = await this._scanForJsonCollections(filePath);
            results = results.concat(subResults);
          }
        } else if (file.endsWith(".json")) {
          try {
            const content = await fs.promises.readFile(filePath, "utf8");
            JSON.parse(content);
            results.push(filePath);
          } catch (e) {
            console.error(
              `[scanForJsonCollections] Arquivo JSON inválido ${file}:`,
              e,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `[scanForJsonCollections] Erro ao ler diretório ${dir}:`,
        error,
      );
    }
    return results;
  }

  private async _handleFileSave(content: any, defaultPath: string, filters?: any[]): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const isString = typeof content === "string";
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Salvar Arquivo",
        defaultPath:
          defaultPath || (isString ? "request.http" : "colecao.json"),
        filters: filters || [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (canceled || !filePath) return { success: false };

      if (isString) {
        await fs.promises.writeFile(filePath, content, "utf8");
      } else {
        this.export.exportJson(filePath, content);
      }
      return { success: true, filePath };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default IpcRouter;
