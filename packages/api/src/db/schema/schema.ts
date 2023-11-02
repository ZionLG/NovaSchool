import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .unique()
    .$defaultFn(() => createId()),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect; // return type when queried
export type NewUser = typeof users.$inferInsert; // insert type
