import { BrowserWindow } from "electron";

export interface IActionLogger {
  log(action: string, user?: string | null): boolean;
  logClear(): boolean;
  logRead(window: BrowserWindow | null): void;
  logStop(): void;
}

export interface DialogOptions {
  label: string;
  value: any;
  variant?: string;
}

export interface DialogParams {
  title?: string;
  description?: string;
  options?: DialogOptions[];
}

export interface IDialogReact {
  showDialog(params: DialogParams): Promise<any>;
}
