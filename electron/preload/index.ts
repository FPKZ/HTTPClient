import { contextBridge } from "electron";
import { userPreload } from "./user.preload";
import { appPreload } from "./app.preload";
import { storagePreload } from "./storage.preload";
import { servicesPreload } from "./services.preload";

console.log("[Preload] Initializing...");

contextBridge.exposeInMainWorld("electronAPI", {
    ...appPreload,
    ...storagePreload,
    ...userPreload,
    ...servicesPreload
});