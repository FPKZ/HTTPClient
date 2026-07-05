import { sqliteTable, primaryKey, text } from "drizzle-orm/sqlite-core";
import { profiles } from "./profiles.schema";
import { relations, sql } from "drizzle-orm";
import { collections } from "./collections.schema";

export const workspaces = sqliteTable('workspaces', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    icon: text('icon'),
    ownerId: text('owner_id').notNull().references(() => profiles.id),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const workspaceMembers = sqliteTable('workspace_members', {
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    userId: text('user_id').notNull().references(() => profiles.id),
    role: text('role').$type<'viewer' | 'editor' | 'admin'>().default('viewer').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
    //Chave primaria composta para
    //evitar duplicidade de membro no mesmo workspace
    pk: primaryKey({ columns: [table.workspaceId, table.userId] }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(profiles, { fields: [workspaces.ownerId], references: [profiles.id] }),
  members: many(workspaceMembers),
  collections: many(collections),
}));

export type Workspaces = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

export type WorkspaceMembers = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;