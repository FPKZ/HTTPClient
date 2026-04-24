import { RequestData, ResponseData, CollectionData } from "./index";

export interface ElectronAPI {
  isDev: boolean;
  getFilePath: (file: any) => string;

  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => () => void;
    send: (channel: string, ...args: any[]) => void;
    invoke: (channel: string, ...args: any[]) => Promise<any>;
  };

  teste: () => void;

  logAction: (action: string, user?: any) => Promise<any>;
  startActionLogger: () => void;
  stopActionLogger: () => void;
  resizeWindow: (bounds: any) => void;
  openActionLogger: () => void;

  minimize: () => void;
  maximize: () => void;
  close: () => void;
  closeAll: () => void;
  forceClose: () => void;
  toggleDevTools: () => void;

  selectFolder: () => Promise<string | null>;
  selectFile: (filters?: any) => Promise<string[] | null>;
  selectSaveLocation: () => Promise<string | null>;
  saveFile: (data: any) => Promise<any>;
  readJsonFile: (path: string) => Promise<any>;
  exportHttp: (data: any) => Promise<any>;
  confirm: (message: string) => Promise<boolean>;
  newFile: () => void;

  request: (data: any) => Promise<ResponseData>;
  cancelRequest: (requestId: string) => void;
  startConversion: (data: any) => void;
  startDownload: () => void;
  onLog: (callback: (value: any) => void) => () => void;
  onFinished: (callback: (value: any) => void) => () => void;

  openMenu: () => void;
  onMenuAction: (callback: (value: any) => void) => () => void;

  getUser: () => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<any>;
  register: (email: string, password: string) => Promise<any>;
  update: (user: any) => Promise<any>;
  onUserChangerd: (callback: (user: any) => void) => () => void;

  getHistory: () => Promise<any[]>;
  saveHistory: (data: any) => Promise<any>;
  getCollectionById: (params: { id: string, source: string }) => Promise<CollectionData>;
  deleteHistoryItem: (id: string) => Promise<any>;
  deleteAllHistory: () => Promise<any>;
  onRequestSaveSession: (callback: () => void) => () => void;
  saveAndQuit: (data: any) => void;

  conect: () => Promise<any>;
  onNetworkStatus: (callback: (status: any) => void) => () => void;

  copy: () => void;
  cut: () => void;
  paste: () => void;
  selectAll: () => void;
}
