import { ipcMain, clipboard, app } from "electron";
import { BaseHandler } from "./base.handler";

export class SystemHandler extends BaseHandler {
  register(): void {
    ipcMain.on("copy-to-clipboard", (_event, text: string) => {
      clipboard.writeText(text);
    });

    ipcMain.on("read-clipboard", (event) => {
      event.returnValue = clipboard.readText();
    });

    ipcMain.handle("get-app-version", () => {
      return app.getVersion();
    });
  }
}
