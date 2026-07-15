import { ipcMain, net } from "electron";
import { BaseHandler } from "./base.handler";
import { INetworkService } from "../../interfaces/network-service.interface";
import { IAppMessenger } from "../../interfaces/app-messenger.interface";
import { ConnectionManager } from "../../services/connection-manager";

export class NetworkHandler extends BaseHandler {
  private network: INetworkService;
  private messenger: IAppMessenger;
  private activeRequests: Map<string, AbortController> = new Map();
  private connectionManager: ConnectionManager;

  constructor(networkService: INetworkService, messenger: IAppMessenger) {
    super();
    this.network = networkService;
    this.messenger = messenger;
    this.connectionManager = new ConnectionManager(messenger);
  }

  register(): void {
    ipcMain.handle("conect", async () => {
      return net.isOnline();
    });

    // Monitoramento de Rede em Tempo Real
    let lastStatus = net.isOnline();
    setInterval(() => {
      const currentStatus = net.isOnline();
      if (currentStatus !== lastStatus) {
        lastStatus = currentStatus;
        this.messenger.sendToMain("network-status", currentStatus);
      }
    }, 5000);

    ipcMain.handle("request", async (event, params: any) => {
      const requestId = params.requestId || Date.now().toString();
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);

      try {
        const result = await this.network.execute(
          { ...params, signal: controller.signal },
          (data: any) => this.messenger.sendToWindow(event.sender, "log", data),
        );
        return result;
      } finally {
        this.activeRequests.delete(requestId);
      }
    });

    ipcMain.on("cancel-request", (_event, requestId: string) => {
      const controller = this.activeRequests.get(requestId);
      if (controller) {
        controller.abort();
        this.activeRequests.delete(requestId);
        console.log(`[NetworkHandler] Requisição ${requestId} cancelada.`);
      }
    });

    // --- Rotas de Conexão WebSocket ---
    ipcMain.on("ws:connect", (event, { requestId, url, headers }) => {
      this.connectionManager.connectWebSocket(requestId, url, headers, event.sender);
    });

    ipcMain.on("ws:send", (_event, { requestId, message }) => {
      this.connectionManager.sendWebSocket(requestId, message);
    });

    ipcMain.on("ws:disconnect", (_event, requestId) => {
      this.connectionManager.disconnectWebSocket(requestId);
    });

    // --- Rotas de Conexão SSE ---
    ipcMain.on("sse:connect", (event, { requestId, url, headers }) => {
      this.connectionManager.connectSse(requestId, url, headers, event.sender);
    });

    ipcMain.on("sse:disconnect", (_event, requestId) => {
      this.connectionManager.disconnectSse(requestId);
    });

    // --- Rotas de Limpeza Geral ---
    ipcMain.on("connection:disconnect-all", (_event, requestId) => {
      this.connectionManager.disconnectAll(requestId);
    });
  }
}
