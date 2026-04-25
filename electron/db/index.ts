import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from './schema/index';

const db = drizzle(new Database('sqlite.db'), { schema });

export { db };