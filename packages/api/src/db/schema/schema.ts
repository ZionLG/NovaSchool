import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const hubs = pgTable("hubs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  hubName: text("hub_name").notNull().unique(),
  hubDescription: text("hub_description"),
});

export const chats = pgTable("chats", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  hubId: uuid("hub_id")
    .notNull()
    .references(() => hubs.id)
    .unique(),
});

export type Hub = typeof hubs.$inferSelect; // return type when queried
export type NewHub = typeof hubs.$inferInsert; // insert type

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  username: text("username").notNull().unique(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  profilesToHubs: many(profilesToHubs),
  chatMessages: many(chatMessages),
}));

export const hubsRelations = relations(hubs, ({ many }) => ({
  profilesToHubs: many(profilesToHubs),
}));
export const chatRelations = relations(chats, ({ many, one }) => ({
  chatMessages: many(chatMessages),
  hubs: one(hubs),
}));

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chats.id),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export type Message = typeof chatMessages.$inferSelect; // return type when queried
export type NewMessage = typeof chatMessages.$inferInsert; // insert type
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMessages.chatId],
    references: [chats.id],
  }),
  profile: one(profiles, {
    fields: [chatMessages.profileId],
    references: [profiles.id],
  }),
}));
export const profilesToHubs = pgTable(
  "profiles_to_hubs",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    hubId: uuid("hub_id")
      .notNull()
      .references(() => hubs.id),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.profileId, t.hubId] }),
  })
);
export const usersToGroupsRelations = relations(profilesToHubs, ({ one }) => ({
  hub: one(hubs, {
    fields: [profilesToHubs.hubId],
    references: [hubs.id],
  }),
  profile: one(profiles, {
    fields: [profilesToHubs.profileId],
    references: [profiles.id],
  }),
}));
