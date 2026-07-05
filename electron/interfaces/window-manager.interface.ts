import { BrowserWindow } from "electron";

export interface IWindowManager {
  getMainWindow(): BrowserWindow | null;
  getUpdateWindow(): BrowserWindow | null;
  focusMainWindow(): void;
  createMainWindow(): BrowserWindow;
  createUpdateWindow(): BrowserWindow;
  createWindow(route: string, collectionId?: string): BrowserWindow;
  setActiveCollectionForWindow(windowId: number, collectionId: string | null): void;
  isCollectionOpenInAnotherWindow(windowId: number, collectionId: string): boolean;
  focusWindowWithCollection(collectionId: string): boolean;
  getActionLoggerWindow(): BrowserWindow | null;
  createActionLoggerWindow(): BrowserWindow | null;
  minimize(): void;
  maximize(): void;
  close(): void;
  closeAll(): void;
  forceCloseApp(): void;
  toggleDevTools(): void;
}

