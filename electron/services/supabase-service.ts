import { createClient, SupabaseClient } from "@supabase/supabase-js";
const Store = require("electron-store");
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Adaptador para o Supabase usar o electron-store como "localStorage" no Processo Main
const store = new (Store.default || Store)();
const customStorage = {
  getItem: (key: string) => store.get(key) as string,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
};

class SupabaseService {
  private client: SupabaseClient | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.init();
  }

  init(): void {
    try {
      console.log("[SupaService] Init...")
      const envPathRoot = path.join(process.cwd(), ".env");
      console.log("[SupabaseService] Procurando .env em:", envPathRoot);
      
      if (fs.existsSync(envPathRoot)) {
        const result = dotenv.config({ path: envPathRoot });
        if (result.error) console.error("[SupabaseService] Erro ao carregar .env:", result.error);
      } else {
        dotenv.config();
      }

      let supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
      let supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();

      // Remove aspas se existirem (ex: "url")
      if (supabaseUrl.startsWith('"') && supabaseUrl.endsWith('"')) {
        supabaseUrl = supabaseUrl.substring(1, supabaseUrl.length - 1);
      }
      if (supabaseKey.startsWith('"') && supabaseKey.endsWith('"')) {
        supabaseKey = supabaseKey.substring(1, supabaseKey.length - 1);
      }

      console.log("[SupabaseService] URL carregada:", supabaseUrl ? "Sim" : "Não", `(Tamanho: ${supabaseUrl.length})`);
      console.log("[SupabaseService] Key carregada:", supabaseKey ? "Sim" : "Não", `(Tamanho: ${supabaseKey.length})`);

      if (!supabaseUrl || !supabaseKey) {
        console.warn("[SupabaseService] Variáveis de ambiente não encontradas.");
        this.isConfigured = false;
        return;
      }

      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          storage: customStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false // No Electron, nós tratamos a URL manualmente no UserService
        }
      });

      this.isConfigured = true;
      console.log("[SupabaseService] Cliente instanciado com sucesso e persistência ativada.");
    } catch (error) {
      console.error("[SupabaseService] Erro ao instanciar Supabase:", error);
      this.isConfigured = false;
    }
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  isActive(): boolean {
    return this.isConfigured && this.client !== null;
  }
}

export default SupabaseService;
