import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey().notNull(),
    state: text("state").notNull(),
    city: text("city").notNull()
});

export const server = sqliteTable("server", {
    id: text("id").primaryKey().notNull(),
    enabled: integer("enabled", { mode: "boolean" })
});
