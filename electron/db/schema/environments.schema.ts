import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";
import { collections } from "./collections.schema";

export const environments = sqliteTable("environments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  collectionsId: text("collections_id").notNull().references(() => collections.id, { onDelete: 'cascade' }),
  variables: text("variables").$type<Variables[]>(), // Salvo como string JSON
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const environmentsRelations = relations(environments, ({ one }) => ({
  collection: one(collections, { fields: [environments.collectionsId], references: [collections.id] }),
}));

export type Environments = typeof environments.$inferSelect;

export type Variables = {
    id: string;
    key: string;
    initialValue: string;
    currentValue: string;
    enabled: boolean;
};