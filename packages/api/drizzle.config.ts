import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/schema.ts",
  out: "./drizzle",
} satisfies Config;
