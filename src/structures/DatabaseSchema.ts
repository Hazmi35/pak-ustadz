import { sqliteTable, text, integer, int } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey().notNull(),
    state: text("state").notNull(),
    city: text("city").notNull()
});

export const server = sqliteTable("server", {
    id: text("id").primaryKey().notNull(),
    enabled: integer("enabled", { mode: "boolean" })
});

export const place = sqliteTable("place", {
    id: int("id").primaryKey({ autoIncrement: true }).notNull(),
    state: text("state").notNull().unique(),
    city: text("city").notNull().unique()
});

export const imsakiyah = sqliteTable("imsakiyah", {
    id: int("id").primaryKey({ autoIncrement: true }).notNull(),
    placeId: int("placeId").notNull(),
    year: int("year").notNull(),
    hijriYear: int("hijriYear").notNull()
});
