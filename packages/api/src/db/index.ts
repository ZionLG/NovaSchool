import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.js";
const client = postgres(env.DIRECT_URL);
const db = drizzle(client);

export default db;
