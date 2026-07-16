import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";
import { IUserRepository } from "../interfaces/user-repository.interface";
import { User } from "../interfaces/user-service.interface";

export class DrizzleUserRepository implements IUserRepository {
  private db: BetterSQLite3Database<typeof schema>;

  constructor(db: BetterSQLite3Database<typeof schema>) {
    this.db = db;
  }

  async deleteProfile(id: string): Promise<boolean> {
    await this.db
      .delete(schema.profiles)
      .where(eq(schema.profiles.id, id))
      .run();
    return true;
  }

  async updateProfile(id: string, updates: Partial<User>): Promise<boolean> {
    await this.db
      .update(schema.profiles)
      .set(updates)
      .where(eq(schema.profiles.id, id))
      .run();
    return true;
  }

  async upsertProfile(user: User): Promise<boolean> {
    await this.db
      .insert(schema.profiles)
      .values(user)
      .onConflictDoUpdate({
        target: schema.profiles.id,
        set: user,
      })
      .run();
    return true;
  }
}
