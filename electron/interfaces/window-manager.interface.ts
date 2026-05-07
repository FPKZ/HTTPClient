import { BrowserWindow } from "electron";

export interface IWindowManager {
  getMainWindow(): BrowserWindow | null;
  getUpdateWindow(): BrowserWindow | null;
  focusMainWindow(): void;
  createMainWindow(): BrowserWindow;
  createUpdateWindow(): BrowserWindow;
  getActionLoggerWindow(): BrowserWindow | null;
  createActionLoggerWindow(): void;
  minimize(): void;
  maximize(): void;
  close(): void;
  closeAll(): void;
  forceCloseApp(): void;
  toggleDevTools(): void;
  // Adicione outros métodos se necessário
}
