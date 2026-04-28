import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { collections } from "./collections.schema";
import { folders } from "./folders.schema";

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  collectionId: text("collection_id").notNull().references(() => collections.id),
  folderId: text("folder_id").references(() => folders.id),
  method: text("method").notNull(), // GET, POST, etc
  url: text("url").notNull(),
  params: text("params").$type<RequestsParams[]>(), // Salvo como string JSON
  headers: text("headers").$type<RequestsHeaders[]>(), // Salvo como string JSON
  body: text("body").$type<RequestsBody>(), // Salvo como string JSON
  auth: text("auth").$type<RequestsAuth>(), // Salvo como string JSON
  isDirty: integer("is_dirty", { mode: "boolean" }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const requestsRelations = relations(requests, ({ one }) => ({
  collection: one(collections, { fields: [requests.collectionId], references: [collections.id] }),
  folder: one(folders, { fields: [requests.folderId], references: [folders.id] }),
}));

export type Requests = typeof requests.$inferSelect;

export type RequestsParams = {
    key?: string;
    value?: string;
    enabled: boolean;
};

export type RequestsHeaders = {
    key: string;
    value: string;
    enabled: boolean;
};

export type RequestsBody = {
    mode: "json" | "none" | "formdata" | "url-encoded" | "binary";
    content: string;
};

export type RequestsAuth = {
  name: string;
  config: {
    key: string;
    type: string | "Bearer" | "Basic" | "Digest" | "Hawk" | "AWSSigV4"; // default "Bearer" : // Basic, Bearer, Digest, Hawk, AWSSigV4
    value: string | "header" | "cookie" | "query" | "body"; // default "header"
  };
  enabled: boolean;
};
