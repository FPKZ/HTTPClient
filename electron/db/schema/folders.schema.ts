import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { collections } from "./collections.schema";

export const folders = sqliteTable('folders', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
    parentId: text('parent_id').references((): any => folders.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').default(0),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
    relationName: 'folder_hierarchy',
  }),
  children: many(folders, {
    relationName: 'folder_hierarchy',
  }),
  collection: one(collections, {
    fields: [folders.collectionId],
    references: [collections.id],
  }),
}));

export type Folders = typeof folders.$inferSelect;