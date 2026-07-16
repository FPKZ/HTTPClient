import { eq, inArray } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { ISyncRepository } from "../interfaces/sync-repository.interface";

export class DrizzleSyncRepository implements ISyncRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async getDirtyRequests(): Promise<any[]> {
    return this.db.query.requests.findMany({
      where: eq(schema.requests.isDirty, true),
    });
  }

  async clearDirtyRequests(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    await this.db
      .update(schema.requests)
      .set({ isDirty: false })
      .where(inArray(schema.requests.id, ids))
      .run();
    return true;
  }
}
