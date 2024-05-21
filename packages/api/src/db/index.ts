import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
import * as schema from "./schema/schema.js";
const client = postgres(env.DIRECT_URL);
const db = drizzle(client, { schema });

export default db;
