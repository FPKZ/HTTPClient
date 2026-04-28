import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import SupabaseService from "./supabase-service";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * UserService
 * Orquestra a autenticação e o perfil do usuário usando Drizzle e Supabase.
 * Segue o princípio de inversão de dependência ao receber o DB no constructor.
 */

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
}

export class UserService {
  private supabaseService: SupabaseService;
  private db: BetterSQLite3Database<typeof schema>;
  private user: User | null = null;

  constructor(supabaseService: SupabaseService, db: BetterSQLite3Database<typeof schema>) {
    this.supabaseService = supabaseService;
    this.db = db;
  }

  get supabase(): SupabaseClient {
    return this.supabaseService.getClient()!;
  }

  /**
   * Tenta recuperar a sessão ativa do Supabase/Local no startup
   */
  async initSession(): Promise<void> {
    if (!this.supabaseService.isActive()) return;

    try {
      const { data } = await this.supabase.auth.getSession();
      if (data && data.session && data.session.user) {
        await this.setLocalUserFromAuth(data.session.user);
      }
    } catch (error) {
      console.error("[UserService] Erro ao inicializar sessão:", error);
    }
  }

  /**
   * Realiza o login
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabaseService.isActive()) {
      // Mock mode para desenvolvimento offline
      this.user = {
        id: "1",
        email: email,
        displayName: "Felipe",
        avatar: null,
      };
      
      // Garante que o usuário mock existe no banco local para FKs não falharem
      await this.setLocalUserFromAuth({
        id: "1",
        email: email,
        user_metadata: { name: "Felipe" }
      });

      return { success: true, user: this.user };
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

      if (error) return { success: false, error: error.message };

      if (data && data.user) {
        await this.setLocalUserFromAuth(data.user);
        return { success: true, user: this.user! };
      }

      return { success: false, error: "Erro desconhecido ao logar." };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async register(email: string, password: string, displayName: string = "") {
    if (!this.supabaseService.isActive()) return { success: false, error: "Cloud offline" };
    
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email, password, options: { data: { name: displayName } }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        await this.setLocalUserFromAuth(data.user);
        return { success: true, user: this.user! };
      }
      return { success: false, error: "Erro ao registrar" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    if (this.supabaseService.isActive()) await this.supabase.auth.signOut();
    this.user = null;
    return { success: true };
  }

  /**
   * Persiste o perfil no SQLite local (Tabela: profiles)
   */
  private async setLocalUserFromAuth(authUser: any) {
    const userId = authUser.id;
    const email = authUser.email;
    const displayName = authUser.user_metadata?.name || email.split("@")[0];
    const avatarUrl = authUser.user_metadata?.avatar_url || null;

    try {
      await this.db.insert(schema.profiles)
        .values({
          id: userId,
          name: displayName,
          avatarPath: avatarUrl, // No local salvamos a URL ou path
        })
        .onConflictDoUpdate({
          target: schema.profiles.id,
          set: { name: displayName, updatedAt: new Date().toISOString() }
        });

      this.user = { id: userId, email, displayName, avatar: avatarUrl };
    } catch (err) {
      console.error("[UserService] Erro ao persistir profile local:", err);
    }
  }

  getUser(): User | null {
    return this.user;
  }

  async update(userParams: any) {
    // Futura implementação
    return { success: false, error: "Not implemented" };
  }
}

export default UserService;
