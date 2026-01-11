const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

/**
 * IpcRouter
 * Centraliza o registro de todos os handlers IPC.
 * Segue o OCP ao permitir delegar chamadas para diferentes serviços sem poluir o main.
 */
class IpcRouter {
  constructor(
    windowManager,
    historyService,
    translator,
    formatters,
    networkService,
    exportService
  ) {
    this.win = windowManager;
    this.history = historyService;
    this.translator = translator;
    this.formatters = formatters;
    this.network = networkService;
    this.export = exportService;
  }

  register() {
    // Window Controls
    ipcMain.on("minimize", () => this.win.minimize());
    ipcMain.on("maximize", () => this.win.maximize());
    ipcMain.on("close", () => this.win.close());
    ipcMain.on("force-close", () => this.win.forceCloseApp());
    ipcMain.on("open-menu", () => {
      const mainWindow = this.win.getMainWindow();
      if (mainWindow) {
        // O menu já foi definido no WindowManager.createMainWindow ou similar
        // Mas precisamos disparar o popup do menu global
        const Menu = require("electron").Menu;
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

    ipcMain.handle("dialog:openFile", async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
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

    // Conversion
    ipcMain.on("start-conversion", async (event, { inputPath, isFile }) => {
      await this._handleConversion(event.sender, inputPath, isFile);
    });

    // History
    ipcMain.handle("get-history", () => this.history.getHistory());
    ipcMain.handle("load-collection", (event, fileName) =>
      this.history.loadCollection(fileName)
    );
    ipcMain.on("save-and-quit", async (event, collectionData) => {
      if (collectionData && collectionData.name) {
        await this.history.saveHistory(collectionData);
      }
      this.win.forceCloseApp();
    });

    ipcMain.handle("save-history", (event, collectionData) => {
      if (collectionData && collectionData.name) {
        this.history.saveHistory(collectionData);
      }
    });

    ipcMain.handle("delete-history-item", (event, id) =>
      this.history.deleteHistoryItem(id)
    );

    // Network / Request
    ipcMain.handle("request", async (event, params) => {
      return this.network.execute(params, (data) =>
        event.sender.send("log", data)
      );
    });

    // Export
    ipcMain.handle("save-file", async (event, { content, defaultPath }) => {
      return this._handleFileSave(content, defaultPath);
    });

    // Context Menu
    ipcMain.on("show-folder-context-menu", (event, params) => {
      // Nota: O main.cjs injeta o contextMenuBuilder no ipcRouter se necessário, 
      // ou podemos passar como dependência. 
      // Verificando main.cjs...
      if (global.contextMenuBuilder) {
        global.contextMenuBuilder.buildContextFolderMenu(params);
      }
    });

    ipcMain.on("show-root-context-menu", (event) => {
      if (global.contextMenuBuilder) {
        global.contextMenuBuilder.buildRootContextMenu();
      }
    });
  }

  async _handleConversion(sender, inputPath, isFile) {
    sender.send("log", `🔍 Iniciando processamento de: ${inputPath}`);

    // SRP: A lógica de busca de arquivos poderia estar em um FileUtils,
    // mas deixamos aqui por enquanto para simplificar ou movemos para o StorageProvider
    const filesToProcess = isFile
      ? [inputPath]
      : this._scanForJsonCollections(inputPath);

    if (filesToProcess.length === 0) {
      sender.send(
        "log",
        "⚠️ Nenhum arquivo de coleção Postman válido encontrado."
      );
      return;
    }
    const results = [];
    for (const file of filesToProcess) {
      try {
        sender.send("log", `📄 Lendo arquivo: ${file}`);
        const rawJson = JSON.parse(fs.readFileSync(file, "utf8"));
        let internalModel;
        sender.send("log", `🔄 Traduzindo...`);
        // console.log("iniciando tradução de ", rawJson);

        if (rawJson.info && rawJson.item) {
          internalModel = this.translator.translate(rawJson);
          console.log("tradução finalizada");
          sender.send("log", `✅ Tradução OK: ${internalModel.name}`);
        } else if (rawJson.id && rawJson.items) {
          internalModel = rawJson;
          console.log("tradução finalizada");
          sender.send("log", `✅ Tradução OK: ${internalModel.name}`);
        } else {
          console.log("arquivo inválido");
          sender.send("log", `❌ Arquivo inválido`);
        }

        const axiosData = this.formatters.axios.format(internalModel);
        const httpData = this.formatters.http.format(internalModel);

        results.push({
          raw: internalModel,
          // name: internalModel.name,
          // descricao: internalModel.descricao,
          // axios: axiosData,
          // http: httpData,
          // fileName: path.basename(file),
        });
        sender.send("log", `✅ Processado com sucesso: ${path.basename(file)}`);
      } catch (err) {
        console.error(`[handleConversion] Erro processando ${file}:`, err);
        sender.send("log", `❌ Erro em ${path.basename(file)}: ${err.message}`);
      }
    }

    sender.send("log", "--- Fim ---");
    sender.send("conversion-finished", {
      success: true,
      count: results.length,
      results,
    });
  }

  _scanForJsonCollections(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (file !== "node_modules")
          results = results.concat(this._scanForJsonCollections(filePath));
      } else if (file.endsWith(".json")) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          const json = JSON.parse(content);
          results.push(filePath);
        } catch (e) {
          console.error(
            `[scanForJsonCollections] Erro processando ${file}:`,
            e
          );
        }
      }
    });
    return results;
  }

  async _handleFileSave(content, defaultPath) {
    try {
      console.log(content);
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Salvar Arquivo",
        defaultPath: defaultPath || `${content.name}.HTTPClient.json`,
        filters: [{ name: "JSON Files", extensions: ["json"] }],
      });

      if (canceled || !filePath) return { success: false };

      // Se o conteúdo for um objeto, assume que é o modelo interno do HttpFormatter
      // Note: O HttpFormatter atualmente não tem um flatten estático fácil aqui,
      // mas podemos injetar ou o frontend já manda formatado.
      // Por simplicidade, assumimos que o conteúdo já vem formatado do frontend ou é uma string.
      this.export.exportJson(filePath, content);
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = IpcRouter;
