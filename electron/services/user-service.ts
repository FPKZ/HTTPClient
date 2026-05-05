import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { SupabaseClient } from "@supabase/supabase-js";
import { shell } from "electron";
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

  async signInWithEmail(email: string, password: string) {
    if (!this.supabase) return { success: false, error: "Serviço Cloud indisponível." };
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = await this.persistUser(data.user);
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message };
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

  async signInWithOAuth(provider: 'google' | 'github') {
    if (!this.supabase) {
      console.error("[UserService] Supabase client não inicializado.");
      return { success: false, error: "Serviço Cloud indisponível." };
    }
    
    console.log(`[UserService] Iniciando login social com: ${provider}`);
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'volt-app://auth-callback' }
    });
    
    if (error) {
      console.error("[UserService] Erro no signInWithOAuth:", error);
      return { success: false, error: error.message };
    }

    if (data.url) {
      console.log("[UserService] Abrindo URL de autenticação:", data.url);
      shell.openExternal(data.url);
      return { success: true };
    }
    
    console.warn("[UserService] Nenhuma URL retornada pelo Supabase.");
    return { success: false, error: "Não foi possível gerar a URL de login." };
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
