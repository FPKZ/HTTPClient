import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { SupabaseClient } from "@supabase/supabase-js";
import { shell } from "electron";
import http from "node:http";
import SupabaseService from "./supabase-service";

/**
 * UserService
 * Orquestra a autenticação e o perfil do usuário usando Drizzle e Supabase.
 */

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  updatedAt: string;
}

interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export class UserService {
  private supabase: SupabaseClient | null;
  private db: BetterSQLite3Database<typeof schema>;
  private currentUser: User | null = null;

  constructor(supabaseService: SupabaseService, db: BetterSQLite3Database<typeof schema>) {
    this.supabase = supabaseService.getClient();
    this.db = db;
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

  async signInWithEmail(email: string, password: string, win: Electron.BrowserWindow) {
    if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
    try {
      win.webContents.send("auth:loading", true);
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = await this.persistUser(data.user);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      win.webContents.send("auth:loading", false);
    }
  }

  async signUpWithEmail(params: CreateUserParams) {
    if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: { data: { name: params.name } }
      });
      if (error) throw error;
      const user = await this.persistUser(data.user);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async signInWithOAuth(provider: 'google' | 'github', win: Electron.BrowserWindow) {
    try {
      if (!this.supabase) {
        console.error("[UserService] Supabase client não inicializado.");
        return { success: false, error: "Serviço Cloud indisponível." };
      }
      
      // Iniciar servidor local temporário para capturar o redirecionamento
      win.webContents.send("auth:loading", true);
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
            <html>
              <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #1e1e1e; color: white;">
                <h1>Login em processamento...</h1>
                <p>O Volt App está sincronizando sua conta. Esta janela fechará automaticamente.</p>
                <script>
                  const hash = window.location.hash;
                  if (hash) {
                    fetch('/capture' + window.location.search + hash.replace('#', '?'))
                      .then(() => {
                        document.body.innerHTML = '<h1>Sucesso!</h1><p>Você já pode fechar esta aba e voltar para o aplicativo.</p>';
                        setTimeout(() => window.close(), 2000);
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
          setTimeout(stopServer, 1000);
          return;
        }

        res.writeHead(404);
        res.end();
      });

      server.listen(port);
      
      // Timeout de segurança: fecha o servidor após 5 minutos se nada acontecer
      setTimeout(stopServer, 5 * 60 * 1000);

      console.log(`[UserService] Iniciando login social com: ${provider} via localhost:${port}`);
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri }
      });
      
      if (error) {
        stopServer();
        console.error("[UserService] Erro no signInWithOAuth:", error);
        return { success: false, error: error.message };
      }

      if (data.url) {
        console.log("[UserService] Abrindo URL de autenticação:", data.url);
        shell.openExternal(data.url);
        return { success: true };
      }
      
      stopServer();
      console.warn("[UserService] Nenhuma URL retornada pelo Supabase.");
      return { success: false, error: "Não foi possível gerar a URL de login." };
    } catch (error: any) {
      console.error("[UserService] Erro ao iniciar login social:", error);
      return { success: false, error: error.message };
    } finally {
      win.webContents.send("auth:loading", false);
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
        console.log("[UserService] Login via Servidor Local concluído para:", data.user);
        
        // Emite um evento ou foca a janela através do processo main (configurado no IpcRouter)
        // O main.ts ou IpcRouter deve escutar mudanças na sessão ou o callback aqui.
        if (global.focusAppWindow) {
          global.focusAppWindow();
        }
      }
    } catch (error) {
      console.error("[UserService] Erro ao completar login OAuth:", error);
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

  async logout() {
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
