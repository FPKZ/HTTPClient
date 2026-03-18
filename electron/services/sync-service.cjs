class SyncService {
  constructor(localDbProvider, supabaseService) {
    this.dbProvider = localDbProvider;
    this.supabaseService = supabaseService;
    this.syncInterval = null;
  }

  startBackgroundSync(intervalMs = 30000) {
    if (!this.supabaseService.isActive()) {
      console.warn('[SyncService] Supabase não configurado. Background Sync desativado.');
      return;
    }

    console.log('[SyncService] Background Sync agendado para rodar a cada', (intervalMs/1000), 'segundos.');
    
    // Roda uma vez de imediato
    this.pushDirtyCollections();

    // Inicia loop
    this.syncInterval = setInterval(() => {
      this.pushDirtyCollections();
    }, intervalMs);

    // Opcional: Aqui poderíamos assinar os real-time WebSockets do Supabase para fazer alterações pull na mesma via.
    // this.listenToRealtimeChanges();
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncService] Background Sync parado.');
    }
  }

  get db() {
    return this.dbProvider.getDb();
  }

  get supabase() {
    return this.supabaseService.getClient();
  }

  async pushDirtyCollections() {
    if (!this.supabaseService.isActive()) return;

    try {
      // 1. Busca localmente o que está sujo (is_dirty = 1) e não foi deletado
      const dirtyCollections = this.db.prepare(`
        SELECT id, workspace_id, owner_id, name, data, updated_at 
        FROM collections 
        WHERE is_dirty = 1 AND deleted_at IS NULL
      `).all();

      if (!dirtyCollections || dirtyCollections.length === 0) {
        return; // Nada a sincronizar
      }

      console.log(`[SyncService] Sincronizando ${dirtyCollections.length} coleção(ões) com a nuvem...`);

      // 2. Transmite ao Supabase
      const payload = dirtyCollections.map(c => {
        let parsedData = null;
        try { if(c.data) parsedData = JSON.parse(c.data); } catch(e){}
        
        return {
          id: c.id,
          // workspace_id: c.workspace_id, // Deixar comentado ou nulável pois a tabela no SB precisa alinhar.
          owner_id: c.owner_id,
          name: c.name,
          data: parsedData, // No Supabase a coluna ideal é JSONB
          updated_at: c.updated_at
        };
      });

      const { data, error } = await this.supabase
        .from('collections') // Requer que exista uma tabela collections no Supabase do user
        .upsert(payload, { onConflict: 'id' })
        .select('id');

      if (error) {
        console.error('[SyncService] Falha no push para Supabase:', error.message);
        return;
      }

      // 3. Marca como sincronizado localmente se o push teve sucesso
      if (data && data.length > 0) {
        const syncedIds = data.map(d => d.id);
        
        // SQLite não suporta array direto no prepare fácilmente com quantidade variável, usa-se bind seguro:
        const placeholders = syncedIds.map(() => '?').join(',');
        this.db.prepare(`UPDATE collections SET is_dirty = 0 WHERE id IN (${placeholders})`).run(...syncedIds);
        
        console.log(`[SyncService] Sucesso. ${syncedIds.length} coleções limpas localmente.`);
      }

    } catch (err) {
      console.error('[SyncService] Exceção durante pushDirtyCollections:', err);
    }
  }
}

module.exports = SyncService;
