import { ipcMain, net } from "electron";
import { BaseHandler } from "./base.handler";
import { INetworkService } from "../../interfaces/network-service.interface";
import { IAppMessenger } from "../../interfaces/app-messenger.interface";

export class NetworkHandler extends BaseHandler {
  private network: INetworkService;
  private messenger: IAppMessenger;
  private activeRequests: Map<string, AbortController> = new Map();

  constructor(networkService: INetworkService, messenger: IAppMessenger) {
    super();
    this.network = networkService;
    this.messenger = messenger;
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
  }
}
