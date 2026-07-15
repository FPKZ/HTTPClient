import axios from "axios";
import { IAppMessenger } from "../interfaces/app-messenger.interface";
import { IConnectionManager } from "../interfaces/connection-manager.interface";

export class ConnectionManager implements IConnectionManager {
  private activeWebSockets = new Map<string, WebSocket>();
  private activeSseControllers = new Map<string, AbortController>();
  private activeSseStreams = new Map<string, any>();
  private messenger: IAppMessenger;

  constructor(messenger: IAppMessenger) {
    this.messenger = messenger;
  }

  /**
   * Conecta a um WebSocket.
   */
  connectWebSocket(requestId: string, url: string, headers: any, sender: any): void {
    // Evita conexões duplicadas para o mesmo requestId
    this.disconnectWebSocket(requestId);

    try {
      this.messenger.sendToWindow(sender, "ws:status", {
        requestId,
        status: "connecting",
      });

      // No Node.js 22+, WebSocket está disponível globalmente.
      // Se necessário passar subprotocolos ou cabeçalhos especiais,
      // as opções de handshake podem ser repassadas no segundo argumento dependendo da engine.
      const socket = new WebSocket(url);
      this.activeWebSockets.set(requestId, socket);

      socket.addEventListener("open", () => {
        this.messenger.sendToWindow(sender, "ws:status", {
          requestId,
          status: "connected",
        });
      });

      socket.addEventListener("message", (event) => {
        this.messenger.sendToWindow(sender, "ws:message", {
          requestId,
          type: "incoming",
          data: event.data,
          timestamp: Date.now(),
        });
      });

      socket.addEventListener("close", (event) => {
        this.activeWebSockets.delete(requestId);
        this.messenger.sendToWindow(sender, "ws:status", {
          requestId,
          status: "disconnected",
          reason: event.reason,
          code: event.code,
        });
      });

      socket.addEventListener("error", (error: any) => {
        this.activeWebSockets.delete(requestId);
        this.messenger.sendToWindow(sender, "ws:status", {
          requestId,
          status: "disconnected",
          error: error.message || "Erro de conexão WebSocket",
        });
      });
    } catch (err: any) {
      this.messenger.sendToWindow(sender, "ws:status", {
        requestId,
        status: "disconnected",
        error: err.message,
      });
    }
  }

  /**
   * Envia uma mensagem por um WebSocket ativo.
   */
  sendWebSocket(requestId: string, message: string): void {
    const socket = this.activeWebSockets.get(requestId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.warn(`[ConnectionManager] WebSocket ${requestId} não está conectado ou aberto.`);
    }
  }

  /**
   * Desconecta um WebSocket ativo.
   */
  disconnectWebSocket(requestId: string): void {
    const socket = this.activeWebSockets.get(requestId);
    if (socket) {
      try {
        socket.close();
      } catch (e) {
        // Ignora erros ao fechar
      }
      this.activeWebSockets.delete(requestId);
    }
  }

  /**
   * Conecta a um stream Server-Sent Events (SSE).
   */
  async connectSse(requestId: string, url: string, headers: any, sender: any): Promise<void> {
    this.disconnectSse(requestId);

    const controller = new AbortController();
    this.activeSseControllers.set(requestId, controller);

    try {
      this.messenger.sendToWindow(sender, "sse:status", {
        requestId,
        status: "connecting",
      });

      const formattedHeaders: Record<string, string> = {
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      };

      if (headers && typeof headers === "object") {
        for (const [k, v] of Object.entries(headers)) {
          formattedHeaders[k] = String(v);
        }
      }

      // Conexão via Axios com responseType "stream"
      const response = await axios({
        method: "get",
        url,
        headers: formattedHeaders,
        responseType: "stream",
        signal: controller.signal,
      });

      this.messenger.sendToWindow(sender, "sse:status", {
        requestId,
        status: "connected",
      });

      const stream = response.data;
      this.activeSseStreams.set(requestId, stream);
      let buffer = "";

      stream.on("data", (chunk: any) => {
        const text = chunk.toString();
        buffer += text;

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventName = "message";
          let data = "";
          let id = "";

          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              data += (data ? "\n" : "") + line.slice(5).trim();
            } else if (line.startsWith("id:")) {
              id = line.slice(3).trim();
            }
          }

          this.messenger.sendToWindow(sender, "sse:message", {
            requestId,
            event: eventName,
            data,
            id,
            timestamp: Date.now(),
          });
        }
      });

      stream.on("end", () => {
        if (this.activeSseControllers.get(requestId) === controller) {
          this.activeSseControllers.delete(requestId);
          this.activeSseStreams.delete(requestId);
          this.messenger.sendToWindow(sender, "sse:status", {
            requestId,
            status: "disconnected",
          });
        }
      });

      stream.on("error", (streamErr: any) => {
        if (this.activeSseControllers.get(requestId) === controller) {
          console.error(`[ConnectionManager] Erro no stream SSE para ${requestId}:`, streamErr);
          this.activeSseControllers.delete(requestId);
          this.activeSseStreams.delete(requestId);
          this.messenger.sendToWindow(sender, "sse:status", {
            requestId,
            status: "disconnected",
            error: streamErr.message || "Erro no stream SSE",
          });
        }
      });

    } catch (err: any) {
      if (axios.isCancel(err) || err.name === "AbortError") {
        // Cancelado intencionalmente pelo usuário
        return;
      }
      console.error(`[ConnectionManager] Erro ao conectar ao SSE ${requestId}:`, err);
      this.activeSseControllers.delete(requestId);
      this.activeSseStreams.delete(requestId);
      this.messenger.sendToWindow(sender, "sse:status", {
        requestId,
        status: "disconnected",
        error: err.message || "Erro na conexão SSE",
      });
    }
  }

  /**
   * Desconecta um stream SSE ativo.
   */
  disconnectSse(requestId: string): void {
    const controller = this.activeSseControllers.get(requestId);
    if (controller) {
      try {
        controller.abort();
      } catch (e) {
        // Ignora
      }
      this.activeSseControllers.delete(requestId);
    }
    const stream = this.activeSseStreams.get(requestId);
    if (stream) {
      try {
        stream.destroy();
      } catch (e) {
        // Ignora
      }
      this.activeSseStreams.delete(requestId);
    }
  }

  /**
   * Fecha qualquer conexão ativa (WS ou SSE) associada ao requestId.
   */
  disconnectAll(requestId: string): void {
    this.disconnectWebSocket(requestId);
    this.disconnectSse(requestId);
  }
}
