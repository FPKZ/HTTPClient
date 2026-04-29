import { drizzle } from "drizzle-orm/better-sqlite3";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from './schema/index';

class InstanceDB {
    private static db: BetterSQLite3Database<typeof schema>;
    private static path: string = "";

    static init(path: string) {
        if (!InstanceDB.db) {
            const sqlite = new Database(path);
            sqlite.pragma('foreign_keys = ON');
            InstanceDB.db = drizzle(sqlite, { schema });
            migrate(InstanceDB.db, {
                migrationsFolder: "./drizzle",
            });
            InstanceDB.path = path;
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