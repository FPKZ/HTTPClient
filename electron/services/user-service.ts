import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { SupabaseClient } from "@supabase/supabase-js";
import { shell } from "electron";
import http from "node:http";
import SupabaseService from "./supabase-service";
import { IAppMessenger } from "../interfaces/app-messenger.interface";
import { IUserService, User, CreateUserParams } from "../interfaces/user-service.interface";

/**
 * UserService
 * Orquestra a autenticação e o perfil do usuário usando Drizzle e Supabase.
 */

export class UserService implements IUserService {
  private supabase: SupabaseClient | null;
  private db: BetterSQLite3Database<typeof schema>;
  private currentUser: User | null = null;
  private messenger: IAppMessenger;

  constructor(supabaseService: SupabaseService, db: BetterSQLite3Database<typeof schema>, messenger: IAppMessenger) {
    this.supabase = supabaseService.getClient();
    this.db = db;
    this.messenger = messenger;
  }

  /**
   * Tenta restaurar a sessão ao iniciar o app
   */
  async initSession(): Promise<User | null> {
    if (!this.supabase) return null;

    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        return await this.persistUser(session.user);
      }
      return null;
    } catch (error) {
      console.error("[UserService] Erro ao inicializar sessão:", error);
      return null;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
    try {
      console.log(`
          Email: ${email}
          Senha: ${password}
        `);
      this.messenger.sendToMain("auth:loading", true);
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      console.log(`
          Data: ${JSON.stringify(data, null, 2)}
          Error: ${JSON.stringify(error, null, 2)}
        `);
      if (error) throw error;
      const user = await this.persistUser(data.user!);
      return { success: true, user: user! };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      this.messenger.sendToMain("auth:loading", false);
    }
  }

  async signUpWithEmail(params: CreateUserParams): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
    try {
      console.log(`
          Email: ${params.email}
          Senha: ${params.password}
          Nome: ${params.name}
        `);
      const { data, error } = await this.supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: { data: { name: params.name } }
      });
      console.log(`
          Data: ${JSON.stringify(data, null, 2)}
          Error: ${JSON.stringify(error, null, 2)}
        `);
      if (error) throw error;
      const user = await this.persistUser(data.user!);
      return { success: true, user: user! };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async signInWithOAuth(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.supabase) {
        console.error("[UserService] Supabase client não inicializado.");
        return { success: false, error: "Serviço Cloud indisponível." };
      }
      
      // Iniciar servidor local temporário para capturar o redirecionamento
      this.messenger.sendToMain("auth:loading", true);
      const port = 54321;
      const redirectUri = `http://localhost:${port}/auth-callback`;
      
      let server: http.Server | null = null;

      const stopServer = () => {
        if (server) {
          server.close();
          server = null;
        }
      };

      server = http.createServer(async (req, res) => {
        const url = new URL(req.url || "", `http://localhost:${port}`);
        
        if (url.pathname === '/auth-callback') {
          // Envia página HTML para capturar o fragmento (#) que o servidor não recebe diretamente
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`
            <!DOCTYPE html>
            <html lang="pt-br">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Volt Auth - Sincronizando</title>
                  <style>
                      :root {
                          --bg-dark: #0f0f0f;
                          --bg-panel: #181818;
                          --volt-yellow: #f59e0b; /* Amarelo vibrante do Volt */
                          --text-main: #e2e8f0;
                          --text-dim: #94a3b8;
                          --border: #2d2d2d;
                      }

                      * { margin: 0; padding: 0; box-box: border-box; }

                      body {
                          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                          background-color: var(--bg-dark);
                          color: var(--text-main);
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          height: 100vh;
                          overflow: hidden;
                      }

                      .container {
                          text-align: center;
                          padding: 2.5rem;
                          background: var(--bg-panel);
                          border: 1px solid var(--border);
                          border-radius: 12px;
                          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                          max-width: 400px;
                          width: 90%;
                          position: relative;
                      }

                      /* Ícone de Raio estilizado (Volt) */
                      .logo-icon {
                          color: var(--volt-yellow);
                          font-size: 3rem;
                          margin-bottom: 1.5rem;
                      }

                      h1 {
                          font-size: 1.25rem;
                          font-weight: 600;
                          margin-bottom: 0.75rem;
                          letter-spacing: -0.025em;
                      }

                      p {
                          color: var(--text-dim);
                          font-size: 0.875rem;
                          line-height: 1.5;
                          margin-bottom: 2rem;
                      }

                      /* Barra de progresso animada */
                      .loader-container {
                          width: 100%;
                          height: 4px;
                          background: var(--border);
                          border-radius: 2px;
                          overflow: hidden;
                      }

                      .loader-bar {
                          width: 30%;
                          height: 100%;
                          background: var(--volt-yellow);
                          border-radius: 2px;
                          animation: loading 1.5s infinite ease-in-out;
                      }

                      @keyframes loading {
                          0% { transform: translateX(-100%); }
                          100% { transform: translateX(400%); }
                      }

                      .status-tag {
                          display: inline-block;
                          font-family: 'JetBrains Mono', monospace;
                          font-size: 10px;
                          text-transform: uppercase;
                          padding: 2px 8px;
                          border-radius: 4px;
                          background: #1e293b;
                          color: var(--volt-yellow);
                          margin-top: 2rem;
                      }
                  </style>
              </head>
              <body>

                  <div class="container" id="card">
                      <div class="logo-icon">
                        <div
                          class="w-24 h-24 bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-lg border border-gray-700"
                        >
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 60 80"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107" />
                          </svg>
                        </div>
                      </div>
                      <h1 id="title">Login em processamento...</h1>
                      <p id="desc">O <strong>Volt API Client</strong> está sincronizando sua conta com segurança. Esta janela fechará em instantes.</p>
                      
                      <div class="loader-container" id="loader">
                          <div class="loader-bar"></div>
                      </div>

                      <div class="status-tag">Status: Handshaking</div>
                  </div>

                  <script>
                      const hash = window.location.hash;
                      if (hash) {
                          // Simulando o capture para a interface
                          fetch('/capture' + window.location.search + hash.replace('#', '?'))
                              .then(() => {
                                  document.getElementById('title').innerText = 'Autenticado!';
                                  document.getElementById('desc').innerHTML = 'Sincronização concluída. Você já pode voltar para o <strong>Volt</strong>.';
                                  document.getElementById('loader').style.display = 'none';
                                  document.querySelector('.status-tag').innerText = 'Status: Success';
                                  document.querySelector('.status-tag').style.color = '#10b981'; // Verde Sucesso
                                  
                                  setTimeout(() => window.close(), 2500);
                              })
                              .catch(err => {
                                  document.getElementById('title').innerText = 'Ops, erro na captura';
                                  document.getElementById('desc').innerText = 'Não foi possível comunicar com o app desktop.';
                              });
                      }
                  </script>
              </body>
            </html>
          `);
          return;
        }

        if (url.pathname === '/capture') {
          const accessToken = url.searchParams.get('access_token');
          const refreshToken = url.searchParams.get('refresh_token');

          if (accessToken && refreshToken) {
            await this.completeOAuthLogin(accessToken, refreshToken);
          }

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("OK");
          
          // Pequeno delay para garantir que o 'res' seja enviado antes de fechar o servidor
          setTimeout(stopServerWithCleanup, 1000);
          return;
        }

        res.writeHead(404);
        res.end();
      });

      server.listen(port);
      
      // Timeout de segurança: fecha o servidor após 5 minutos se nada acontecer
      const timeoutId = setTimeout(() => {
        if (server) {
          stopServer();
          this.messenger.sendToMain("auth:loading", false);
          console.log("[UserService] Servidor local de autenticação encerrado por timeout.");
        }
      }, 5 * 60 * 1000);

      // Limpar o timeout se o servidor for fechado antes
      const originalStopServer = stopServer;
      const stopServerWithCleanup = () => {
        clearTimeout(timeoutId);
        originalStopServer();
      };

      console.log(`[UserService] Iniciando login social com: ${provider} via localhost:${port}`);
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri }
      });
      
      if (error) {
        stopServerWithCleanup();
        console.error("[UserService] Erro no signInWithOAuth:", error);
        this.messenger.sendToMain("auth:loading", false);
        return { success: false, error: error.message };
      }

      if (data.url) {
        console.log("[UserService] Abrindo URL de autenticação:", data.url);
        shell.openExternal(data.url);
        return { success: true };
      }
      
      stopServerWithCleanup();
      console.warn("[UserService] Nenhuma URL retornada pelo Supabase.");
      this.messenger.sendToMain("auth:loading", false);
      return { success: false, error: "Não foi possível gerar a URL de login." };
    } catch (error: any) {
      console.error("[UserService] Erro ao iniciar login social:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Completa o login OAuth usando os tokens capturados
   */
  private async completeOAuthLogin(accessToken: string, refreshToken: string) {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
      if (data.user) {
        await this.persistUser(data.user);
        console.log("[UserService] Login via Servidor Local concluído para:", data.user.email);
        
        // Emite um evento ou foca a janela através do processo main (configurado no IpcRouter)
        // O main.ts ou IpcRouter deve escutar mudanças na sessão ou o callback aqui.
        this.messenger.focusMain();
      }
    } catch (error) {
      console.error("[UserService] Erro ao completar login OAuth:", error);
    } finally {
      this.messenger.sendToMain("auth:loading", false);
    }
  }

  /**
   * Processa o retorno do Deep Linking (OAuth)
   */
  async handleAuthCallback(url: string) {
    if (!this.supabase) return;
    try {
      const parsedUrl = new URL(url.replace('volt-app://', 'http://localhost/'));
      const hashParams = new URLSearchParams(parsedUrl.hash.substring(1));
      
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        const { data, error } = await this.supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
        if (data.user) {
          await this.persistUser(data.user);
          console.log("[UserService] Login OAuth concluído para:", data.user.email);
          return { success: true, user: data.user };
        }
      }
    } catch (error) {
      console.error("[UserService] Erro no callback de autenticação:", error);
    }
  }

  async logout(): Promise<{ success: boolean }> {
    if (this.supabase) await this.supabase.auth.signOut();
    this.currentUser = null;
    return { success: true };
  }

  private async persistUser(supabaseUser: any): Promise<User | null> {
    if (!supabaseUser) return null;

    const userData: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email!,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.db
        .insert(schema.profiles)
        .values(userData)
        .onConflictDoUpdate({
          target: schema.profiles.id,
          set: userData,
        });

      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error("[UserService] Erro ao persistir usuário no SQLite:", error);
      return userData; // Retorna o objeto mesmo se falhar a persistência local
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export default UserService;
