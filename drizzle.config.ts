import type { Config } from "drizzle-kit";

export default {
    schema: "./src/structures/DatabaseSchema.ts",
    out: "./drizzle",
    driver: "better-sqlite"
} satisfies Config;
