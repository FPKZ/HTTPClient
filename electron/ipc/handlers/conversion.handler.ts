import { ipcMain, WebContents } from "electron";
import fs from "fs";
import path from "path";
import { BaseHandler } from "./base.handler";
import PostmanTranslator from "../../core/postman-translator";
import { IDialogReact } from "../../interfaces/utils.interface";

export class ConversionHandler extends BaseHandler {
  private translator: PostmanTranslator;
  private dialogReact: IDialogReact;

  constructor(translator: PostmanTranslator, dialogReact: IDialogReact) {
    super();
    this.translator = translator;
    this.dialogReact = dialogReact;
  }

  register(): void {
    ipcMain.on("start-conversion", async (event, { inputPath, isFile }: { inputPath: string; isFile: boolean }) => {
      this._handleConversion(event.sender, inputPath, isFile);
    });
  }

  private async _handleConversion(sender: WebContents, inputPath: string, isFile: boolean): Promise<void> {
    sender.send("log", `🔍 Iniciando processamento de: ${inputPath}`);

    const filesToProcess = isFile
      ? [inputPath]
      : await this._scanForJsonCollections(inputPath);

    if (filesToProcess.length === 0) {
      sender.send("log", "⚠️ Nenhum arquivo de coleção Postman válido encontrado.");
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

        results.push({ raw: internalModel });
        sender.send("log", `✅ Processado com sucesso: ${path.basename(file)}`);
      } catch (err: any) {
        console.error(`[ConversionHandler] Erro processando ${file}:`, err);
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
          } catch (e) {}
        }
      }
    } catch (error) {}
    return results;
  }
}
