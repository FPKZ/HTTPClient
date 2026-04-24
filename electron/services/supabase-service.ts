import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

class SupabaseService {
  private client: SupabaseClient | null = null;
  private isConfigured: boolean = false;
  private userDataPath: string;

  constructor(userDataPath: string) {
    this.userDataPath = userDataPath;
    this.init();
  }

  init(): void {
    try {
      // Prioriza a leitura do .env diretamente do diretório atual se disponível
      const envPathRoot = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPathRoot)) {
        dotenv.config({ path: envPathRoot });
      } else {
        dotenv.config(); // fallback
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn(
          "[SupabaseService] Variáveis SUPABASE_URL e SUPABASE_ANON_KEY não encontradas. Funcionalidade em nuvem desativada."
        );
        this.isConfigured = false;
        return;
      }

      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          // Idealmente, poderíamos acoplar uma storage customizada pro electron (ex: via user-data),
          // mas isso fica para o módulo avançado de Auth.
        },
      });

      this.isConfigured = true;
      console.log("[SupabaseService] Cliente instanciado com sucesso.");
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
