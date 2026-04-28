import { eq, inArray } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import SupabaseService from "./supabase-service";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * SyncService
 * Gerencia a sincronização entre o SQLite local e o Supabase.
 * Refatorado para usar Drizzle ORM.
 */

class SyncService {
  private db: BetterSQLite3Database<typeof schema>;
  private supabaseService: SupabaseService;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(db: BetterSQLite3Database<typeof schema>, supabaseService: SupabaseService) {
    this.db = db;
    this.supabaseService = supabaseService;
  }

  get supabase(): SupabaseClient {
    return this.supabaseService.getClient()!;
  }

  /**
   * Inicia o loop de sincronização em segundo plano.
   */
  startBackgroundSync(intervalMs: number = 30000): void {
    if (!this.supabaseService.isActive()) {
      console.warn("[SyncService] Supabase offline. Sync desativado.");
      return;
    }

    // Execução imediata
    this.pushDirtyData();

    this.syncInterval = setInterval(() => {
      this.pushDirtyData();
    }, intervalMs);
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Identifica dados alterados localmente (isDirty) e envia para a nuvem.
   * Nota: No modelo relacional, sincronizamos cada tabela separadamente.
   */
  async pushDirtyData(): Promise<void> {
    if (!this.supabaseService.isActive()) return;

    try {
      // Exemplo: Sincronizando Requests
      const dirtyRequests = await this.db.query.requests.findMany({
        where: eq(schema.requests.isDirty, true)
      });

      if (dirtyRequests.length === 0) return;

      console.log(`[SyncService] Sincronizando ${dirtyRequests.length} requisições...`);

      // Aqui faríamos o push para o Supabase
      // const { error } = await this.supabase.from('requests').upsert(dirtyRequests);
      
      // Se sucesso, limpamos o flag local
      const ids = dirtyRequests.map(r => r.id);
      await this.db.update(schema.requests)
        .set({ isDirty: false })
        .where(inArray(schema.requests.id, ids));

    } catch (err) {
      console.error("[SyncService] Erro na sincronização:", err);
    }
  }
}

export default SyncService;
