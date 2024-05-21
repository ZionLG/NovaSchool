import type { Config } from "drizzle-kit";
import { env } from "./src/env";
export default {
  schema: "./src/db/schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DIRECT_URL,
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
  },
} satisfies Config;
