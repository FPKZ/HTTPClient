const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class LocalDbProvider {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.dbPath = path.join(userDataPath, 'database.sqlite');
    this.initDb();
  }

  initDb() {
    try {
      this.db = new Database(this.dbPath);
      
      // Ativa persistência síncrona/segura
      this.db.pragma('journal_mode = WAL');

      this.createTables();
    } catch (error) {
      console.error('Erro ao inicializar o banco de dados:', error);
      throw error;
    }
  }

  createTables() {
    // Tabela Users
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        display_name TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela User Settings
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY,
        auto_save_enabled BOOLEAN DEFAULT 1,
        default_workspace_id TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabela Workspaces
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT,
        owner_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    // Tabela Collections
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        owner_id TEXT,
        name TEXT,
        data JSON,
        last_modified_by TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        is_dirty BOOLEAN DEFAULT 0,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY (owner_id) REFERENCES users(id),
        FOREIGN KEY (last_modified_by) REFERENCES users(id)
      )
    `);
  }

  getDb() {
    if (!this.db) {
      this.initDb();
    }
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

module.exports = LocalDbProvider;
