import { ipcMain } from "electron";
import { BaseHandler } from "./base.handler";
import { IDialogReact } from "../../interfaces/utils.interface";

export class DialogHandler extends BaseHandler {
  private dialogReact: IDialogReact;

  constructor(dialogReact: IDialogReact) {
    super();
    this.dialogReact = dialogReact;
  }

  register(): void {
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
  }
}
