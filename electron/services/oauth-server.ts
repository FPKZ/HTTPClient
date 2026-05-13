import http from "node:http";
import { OAUTH_CALLBACK_HTML } from "./oauth-html";
import { IOAuthServer, OAuthServerOptions } from "../interfaces/oauth-server.interface";

/**
 * OAuthServer
 * Servidor HTTP local temporário para capturar tokens de autenticação social.
 */
export class OAuthServer implements IOAuthServer {
  private server: http.Server | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private captureTimerId: NodeJS.Timeout | null = null;
  private options: OAuthServerOptions | null = null;

  start(options: OAuthServerOptions): void {
    this.stop(); // Garante limpeza anterior
    this.options = options;

    this.server = http.createServer(async (req, res) => {
      const url = new URL(req.url || "", `http://localhost:${options.port}`);

      if (url.pathname === '/auth-callback') {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(OAUTH_CALLBACK_HTML);

        // Timer de captura: se /capture não chegar em 90s após o callback
        this.captureTimerId = setTimeout(() => {
          options.onError("Autenticação cancelada ou não concluída. Tente novamente.");
          this.stop();
        }, 90_000);
        return;
      }

      if (url.pathname === '/capture') {
        if (this.captureTimerId) {
          clearTimeout(this.captureTimerId);
          this.captureTimerId = null;
        }

        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          await options.onTokensCaptured(accessToken, refreshToken);
        }

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");

        // Pequeno delay para garantir que o 'res' seja enviado antes de fechar
        setTimeout(() => this.stop(), 1000);
        return;
      }

      res.writeHead(404);
      res.end();
    });

    this.server.listen(options.port);

    // Timeout global de 5 minutos
    this.timeoutId = setTimeout(() => {
      options.onError("Tempo limite de autenticação excedido.");
      this.stop();
    }, 5 * 60 * 1000);
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.captureTimerId) {
      clearTimeout(this.captureTimerId);
      this.captureTimerId = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    this.options = null;
  }
}
