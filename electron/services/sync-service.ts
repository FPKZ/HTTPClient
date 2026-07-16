import SupabaseService from "./supabase-service";
import { SupabaseClient } from "@supabase/supabase-js";
import { ISyncRepository } from "../interfaces/sync-repository.interface";

export class SyncService {
  private repo: ISyncRepository;
  private supabaseService: SupabaseService;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(repo: ISyncRepository, supabaseService: SupabaseService) {
    this.repo = repo;
    this.supabaseService = supabaseService;
  }

  get supabase(): SupabaseClient {
    return this.supabaseService.getClient()!;
  }

  startBackgroundSync(intervalMs: number = 30000): void {
    if (!this.supabaseService.isActive()) {
      console.warn("[SyncService] Supabase offline. Sync desativado.");
      return;
    }

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

  async pushDirtyData(): Promise<void> {
    if (!this.supabaseService.isActive()) return;

    try {
      const dirtyRequests = await this.repo.getDirtyRequests();
      if (dirtyRequests.length === 0) return;

      console.log(`[SyncService] Sincronizando ${dirtyRequests.length} requisições...`);

      const ids = dirtyRequests.map(r => r.id);
      await this.repo.clearDirtyRequests(ids);
    } catch (err) {
      console.error("[SyncService] Erro na sincronização:", err);
    }
  }
}

export default SyncService;
