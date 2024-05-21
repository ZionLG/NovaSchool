import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uuid,
  primaryKey,
  pgEnum,
  boolean,
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
  xp: integer("xp").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  profilesToHubs: many(profilesToHubs),
  chatMessages: many(chatMessages),
  missionParticipants: many(missionParticipants),
}));

export const hubsRelations = relations(hubs, ({ many, one }) => ({
  profilesToHubs: many(profilesToHubs),
  chat: one(chats, {
    fields: [hubs.id],
    references: [chats.hubId],
  }),
  missions: many(missions),
}));
export const chatRelations = relations(chats, ({ many, one }) => ({
  chatMessages: many(chatMessages),
  hub: one(hubs),
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

export const missions = pgTable("missions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  hubId: uuid("hub_id")
    .notNull()
    .references(() => hubs.id),
});
export type Mission = typeof missions.$inferSelect; // return type when queried

export const submissionStatusEnum = pgEnum("submission_status", [
  "PendingApproval",
  "Approved",
  "Declined",
]);

export const missionSubmissions = pgTable("mission_submissions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id),
  proofUrl: text("proof_url"),
  status: submissionStatusEnum("status").default("PendingApproval"),
});

export const missionParticipants = pgTable(
  "mission_participants",
  {
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => missionSubmissions.id),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.submissionId, t.profileId] }),
  })
);

export const missionsRelations = relations(missions, ({ many, one }) => ({
  hub: one(hubs, {
    fields: [missions.hubId],
    references: [hubs.id],
  }),
  submissions: many(missionSubmissions),
}));

export const missionSubmissionsRelations = relations(
  missionSubmissions,
  ({ many, one }) => ({
    mission: one(missions, {
      fields: [missionSubmissions.missionId],
      references: [missions.id],
    }),
    participants: many(missionParticipants),
  })
);

export const missionParticipantsRelations = relations(
  missionParticipants,
  ({ many, one }) => ({
    submission: one(missionSubmissions, {
      fields: [missionParticipants.submissionId],
      references: [missionSubmissions.id],
    }),
    profile: one(profiles, {
      fields: [missionParticipants.profileId],
      references: [profiles.id],
    }),
  })
);
