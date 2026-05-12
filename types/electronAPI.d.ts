
import { AppAPI } from "./api/app";
import { StorageAPI } from "./api/storage";
import { UserAPI } from "./api/user";
import { ServicesAPI } from "./api/services";

export interface ElectronAPI extends AppAPI, StorageAPI, UserAPI, ServicesAPI {}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
