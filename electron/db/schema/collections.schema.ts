import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { workspaces } from "./workspaces.schema";
import { relations, sql } from "drizzle-orm";
import { requests } from "./requests.schema";
import { environments } from "./environments.schema";
import { folders } from "./folders.schema";
import { profiles } from "./profiles.schema";

export const collections = sqliteTable('collections', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description').$type<string>().default(''),
    workspaceId: text('workspace_id').references(() => workspaces.id),
    ownerId: text('owner_id').references(() => profiles.id),
    orderIndex: integer('order_index').default(0),
    activeEnv: text('active_env').references((): any => environments.id),
    storageType: text('storage_type').$type<'local' | 'remote'>().default('local'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [collections.workspaceId], references: [workspaces.id] }),
  requests: many(requests),
  folders: many(folders),
  environments: many(environments),
  owner: one(profiles, { fields: [collections.ownerId], references: [profiles.id] }),
}));

export type Collections = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

