import { drizzle } from "drizzle-orm/better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from './schema/index';

class InstanceDB {
    private static db: BetterSQLite3Database<typeof schema>;
    private static path: string = "";

    static init(dbPath: string, migrationsPath: string) {
        if (!InstanceDB.db) {
            const sqlite = new Database(dbPath);
            sqlite.pragma('foreign_keys = ON');
            
            // Garante que a coluna email exista na tabela profiles
            try {
                sqlite.exec("ALTER TABLE profiles ADD COLUMN email TEXT;");
            } catch (e) {
                // Coluna provavelmente já existe ou tabela ainda será criada pelas migrações
            }

            // Garante que a coluna protocol exista na tabela requests
            try {
                sqlite.exec("ALTER TABLE requests ADD COLUMN protocol TEXT DEFAULT 'http';");
            } catch (e) {
                // Coluna provavelmente já existe
            }

            InstanceDB.db = drizzle(sqlite, { schema });
            
            console.log(`[InstanceDB] Inicializando migrações em: ${migrationsPath}`);
            migrate(InstanceDB.db, {
                migrationsFolder: migrationsPath,
            });
            InstanceDB.path = dbPath;
        }
    }

    static getDB() {
        if (!InstanceDB.db) {
            throw new Error("InstanceDB not initialized");
        }
        return InstanceDB.db;
    }
    
}


export { InstanceDB };