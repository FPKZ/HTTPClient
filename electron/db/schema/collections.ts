import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { workspaces } from "./workspaces";
import { relations, sql } from "drizzle-orm";
import { requests } from "./requests";

export const collections = sqliteTable('collections', {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').references(() => workspaces.id),
    name: text('name').notNull(),
    orderIndex: integer('order_index').default(0),
    storageType: text('storage_type').$type<'local' | 'remote'>().default('local'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [collections.workspaceId], references: [workspaces.id] }),
  requests: many(requests),
}));
