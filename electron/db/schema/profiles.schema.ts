import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const profiles = sqliteTable('profiles', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    avatarPath: text('avatar_path'),
    avatarUrl: text('avatar_url'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export type Profiles = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
