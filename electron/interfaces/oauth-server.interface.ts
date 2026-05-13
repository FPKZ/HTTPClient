export interface OAuthServerOptions {
  port: number;
  onTokensCaptured: (accessToken: string, refreshToken: string) => Promise<void>;
  onError: (message: string) => void;
}

/**
 * IOAuthServer
 * Interface para o servidor local de captura de tokens OAuth.
 */
export interface IOAuthServer {
  /**
   * Inicia o servidor com as opções fornecidas.
   */
  start(options: OAuthServerOptions): void;

  /**
   * Encerra o servidor e limpa recursos.
   */
  stop(): void;
}
