import SupabaseService from "./supabase-service";
import LocalDbProvider from "../utils/local-db-provider";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database as DatabaseType } from "better-sqlite3";

/**
 * User service
 * Refatorado para integrar com Supabase Auth e Banco de Dados Local (SQLite)
 */

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar: string | null;
}

class UserService {
  private supabaseService: SupabaseService;
  private dbProvider: LocalDbProvider;
  private user: User | null = null; // Usuário logado em memória

  constructor(supabaseService: SupabaseService, localDbProvider: LocalDbProvider) {
    this.supabaseService = supabaseService;
    this.dbProvider = localDbProvider;
  }

  get supabase(): SupabaseClient {
    return this.supabaseService.getClient()!;
  }

  get db(): DatabaseType {
    return this.dbProvider.getDb();
  }

  /**
   * Tenta recuperar a sessão ativa do Supabase/Local no startup
   */
  async initSession(): Promise<void> {
    if (!this.supabaseService.isActive()) return;

    const { data } = await this.supabase.auth.getSession();
    if (data && data.session && data.session.user) {
      this.setLocalUserFromAuth(data.session.user);
    }
  }

  /**
   * Realiza o login via Supabase
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Mock para desenvolvimento se necessário ou implementação real
    if (!this.supabaseService.isActive()) {
      // Mock mode
      this.user = {
        id: "1",
        email: "[EMAIL_ADDRESS]",
        displayName: "Teste",
        avatar: null,
      };
      return { success: true, user: this.user };
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.user) {
        this.setLocalUserFromAuth(data.user);
        return { success: true, user: this.user! };
      }

      return { success: false, error: "Erro desconhecido ao logar." };
    } catch (error: any) {
      console.error("[UserService] Erro ao logar:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Realiza o registro via Supabase
   */
  async register(
    email: string,
    password: string,
    displayName: string = ""
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!this.supabaseService.isActive()) {
      return { success: false, error: "Serviço de Nuvem indisponível." };
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: displayName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.user) {
        this.setLocalUserFromAuth(data.user);
        return { success: true, user: this.user! };
      }

      return { success: false, error: "Erro ao registrar." };
    } catch (error: any) {
      console.error("[UserService] Erro ao registrar:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Encerra sessão
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.supabaseService.isActive()) {
        await this.supabase.auth.signOut();
      }
      this.user = null;
      return { success: true };
    } catch (error: any) {
      console.error("[UserService] Erro ao deslogar:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincroniza os dados do usuário autenticado para a tabela SQLite local
   */
  private setLocalUserFromAuth(authUser: any): void {
    const userId = authUser.id;
    const email = authUser.email;
    const displayName = authUser.user_metadata?.name || email.split("@")[0];
    const avatarUrl = authUser.user_metadata?.avatar_url || null;

    try {
      // Upsert no BD Local para Cache
      const stmt = this.db.prepare(`
                INSERT INTO users (id, email, display_name, avatar_url)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    email=excluded.email,
                    display_name=excluded.display_name,
                    avatar_url=excluded.avatar_url
            `);

      stmt.run(userId, email, displayName, avatarUrl);

      this.user = {
        id: userId,
        email: email,
        displayName: displayName,
        avatar: avatarUrl,
      };
    } catch (err) {
      console.error("[UserService] Falha ao persistir usuário localmente:", err);
    }
  }

  getUser(): User | null {
    return this.user;
  }

  async update(_userParams: any): Promise<{ success: boolean; error?: string }> {
    // Implementação futura de update de profile
    return { success: false, error: "Not implemented" };
  }
}

export default UserService;
