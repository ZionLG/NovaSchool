import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const hubs = pgTable("hubs", {
  id: serial("id").primaryKey(),
  hubName: text("hub_name"),
  hubDescription: text("hub_description"),
});

export type Hub = typeof hubs.$inferSelect; // return type when queried
export type NewHub = typeof hubs.$inferInsert; // insert type
