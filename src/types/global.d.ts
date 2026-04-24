import { ElectronAPI } from "./electronAPI";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
