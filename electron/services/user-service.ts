import { SupabaseClient } from "@supabase/supabase-js";
import { IUserRepository } from "../interfaces/user-repository.interface";
import { shell } from "electron";
import SupabaseService from "./supabase-service";
import { IAppMessenger } from "../interfaces/app-messenger.interface";
import { IUserService, User, CreateUserParams } from "../interfaces/user-service.interface";
import { INetworkService } from "../interfaces/network-service.interface";
import { IOAuthServer } from "../interfaces/oauth-server.interface";

/**
 * UserService
 * Orquestra a autenticação e o perfil do usuário usando Drizzle e Supabase.
 */

export class UserService implements IUserService {
  private supabase: SupabaseClient | null;
  private repo: IUserRepository;
  private currentUser: User | null = null;
  private messenger: IAppMessenger;
  private network: INetworkService;
  private oauthServer: IOAuthServer;

  constructor(
    supabaseService: SupabaseService, 
    repo: IUserRepository, 
    messenger: IAppMessenger,
    networkService: INetworkService,
    oauthServer: IOAuthServer
  ) {
    this.supabase = supabaseService.getClient();
    this.repo = repo;
    this.messenger = messenger;
    this.network = networkService;
    this.oauthServer = oauthServer;
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
      this.messenger.sendToMain("auth:loading", true);
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = await this.persistUser(data.user!);
      this.messenger.sendToMain("auth:success", user);
      return { success: true, user: user! };
    } catch (err: any) {
      this.messenger.sendToMain("auth:error", err.message);
      return { success: false, error: err.message };
    } finally {
      this.messenger.sendToMain("auth:loading", false);
    }
  }

  async signUpWithEmail(params: CreateUserParams): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: { data: { name: params.name } }
      });
      if (error) throw error;
      const user = await this.persistUser(data.user!);
      return { success: true, user: user! };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async signInWithOAuth(provider: 'google' | 'github'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
      
      // Iniciar servidor local temporário para capturar o redirecionamento
      this.messenger.sendToMain("auth:loading", true);
      const port = 54321;
      const redirectUri = `http://localhost:${port}/auth-callback`;
      
      this.oauthServer.stop();

      this.oauthServer.start({
        port,
        onTokensCaptured: async (access, refresh) => {
          await this.completeOAuthLogin(access, refresh);
        },
        onError: (err) => {
          this.messenger.sendToMain("auth:loading", false);
          this.messenger.sendToMain("auth:error", err);
        }
      });

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri }
      });

      if (error) {
        this.oauthServer.stop();
        this.messenger.sendToMain("auth:loading", false);
        return { success: false, error: error.message };
      }

      if (data.url) {
        shell.openExternal(data.url);
        return { success: true };
      }

      this.oauthServer.stop();
      this.messenger.sendToMain("auth:loading", false);
      return { success: false, error: "Não foi possível gerar a URL de login." };
    } catch (error: any) {
      this.oauthServer.stop();
      this.messenger.sendToMain("auth:loading", false);
      return { success: false, error: error.message };
    }
  }

  cancelOAuth(): void {
    this.oauthServer.stop();
    this.messenger.sendToMain("auth:loading", false);
    this.messenger.sendToMain("auth:error", "Login cancelado.");
  }

  private async completeOAuthLogin(accessToken: string, refreshToken: string) {
    if (!this.supabase) return;
    try {
      const { data, error } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
      if (data.user) {
        const user = await this.persistUser(data.user);
        this.messenger.sendToMain("auth:success", user);
        this.messenger.focusMain();
      }
    } catch (error: any) {
      console.error("[UserService] Erro ao completar login OAuth:", error);
      this.messenger.sendToMain("auth:error", error.message);
    } finally {
      this.messenger.sendToMain("auth:loading", false);
    }
  }

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
          const user = await this.persistUser(data.user);
          this.messenger.sendToMain("auth:success", user);
          this.messenger.focusMain();
          return { success: true, user };
        }
      }
    } catch (error: any) {
      console.error("[UserService] Erro no callback de autenticação:", error);
      this.messenger.sendToMain("auth:error", error.message);
    }
  }

  async logout(): Promise<{ success: boolean }> {
    if (this.supabase) {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        await this.repo.deleteProfile(user.id);
      }
      await this.supabase.auth.signOut();
    }
    this.currentUser = null;
    return { success: true };
  }

  /**
   * Atualiza o perfil do usuário na Nuvem (Supabase) e no Cache Local (SQLite)
   */
  async updateProfile(params: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabase || !this.currentUser) return { success: false, error: "Usuário não autenticado." };

    try {
      const updatedData = {
        ...this.currentUser,
        ...params,
        updatedAt: new Date().toISOString(),
      };

      // 1. Sincroniza com a Nuvem (Apenas a URL, nunca Base64)
      const { error: cloudError } = await this.supabase
        .from('profiles')
        .update({
          name: updatedData.name,
          avatar_url: params.avatarUrl || updatedData.avatarUrl, // Mantém a URL/Link
          updated_at: updatedData.updatedAt
        })
        .eq('id', this.currentUser.id);

      if (cloudError) throw cloudError;

      // 2. Atualiza o Cache Local (Pode ser Base64 para Offline)
      await this.repo.updateProfile(this.currentUser.id, updatedData);

      this.currentUser = updatedData;
      this.messenger.sendToMain("auth:success", updatedData);
      
      return { success: true, user: updatedData };
    } catch (err: any) {
      console.error("[UserService] Erro ao sincronizar perfil com a nuvem:", err);
      return { success: false, error: err.message };
    }
  }

  private async persistUser(supabaseUser: any): Promise<User | null> {
    if (!supabaseUser || !this.supabase) return null;

    try {
      // 1. BUSCAR NA NUVEM
      const { data: cloudProfile, error: fetchError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      let userData: User;

      if (cloudProfile) {
        // PERFIL EXISTE NA NUVEM: Baixamos a imagem para o cache local (Base64)
        let localAvatar = cloudProfile.avatar_url;
        if (localAvatar && localAvatar.startsWith('http')) {
          const base64 = await this.downloadAvatarAsBase64(localAvatar);
          if (base64) localAvatar = base64;
        }

        userData = {
          id: cloudProfile.id,
          name: cloudProfile.name,
          email: supabaseUser.email!,
          avatarUrl: localAvatar, // Base64 para o SQLite
          updatedAt: cloudProfile.updated_at,
        };
      } else {
        // NOVO USUÁRIO: Criamos o perfil
        const remoteAvatarUrl = supabaseUser.user_metadata?.avatar_url || null;
        let localAvatarUrl = remoteAvatarUrl;

        // Converte para Base64 apenas para o cache local
        if (remoteAvatarUrl && remoteAvatarUrl.startsWith('http')) {
          const base64Avatar = await this.downloadAvatarAsBase64(remoteAvatarUrl);
          if (base64Avatar) localAvatarUrl = base64Avatar;
        }

        userData = {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email!,
          avatarUrl: localAvatarUrl, // Base64 para o SQLite
          updatedAt: new Date().toISOString(),
        };

        // Salva na NUVEM (apenas a URL original)
        await this.supabase
          .from('profiles')
          .insert({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar_url: remoteAvatarUrl, // LINK original
            updated_at: userData.updatedAt
          });
      }

      // 2. ESPELHAR NO CACHE LOCAL (Sempre Base64 se disponível)
      await this.repo.upsertProfile(userData);

      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error("[UserService] Erro crítico na persistência Cloud-First:", error);
      return null;
    }
  }

  private async downloadAvatarAsBase64(url: string): Promise<string | null> {
    try {
      const response = await this.network.execute({
        url,
        method: 'GET',
        bodyMode: 'binary'
      });

      if (response.isImage && typeof response.data === 'string') {
        return `data:${response.contentType};base64,${response.data}`;
      }
      return null;
    } catch (error) {
      console.error("[UserService] Erro ao baixar avatar via NetworkService:", error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export default UserService;
