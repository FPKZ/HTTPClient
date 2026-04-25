import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { collections } from "./collections";

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  collectionId: text("collection_id").notNull().references(() => collections.id),
  method: text("method").notNull(), // GET, POST, etc
  url: text("url").notNull(),
  body: text("body"), // Salvo como string JSON
  headers: text("headers"), // Salvo como string JSON
  isDirty: integer("is_dirty", { mode: "boolean" }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const requestsRelations = relations(requests, ({ one }) => ({
  collection: one(collections, { fields: [requests.collectionId], references: [collections.id] }),
}));