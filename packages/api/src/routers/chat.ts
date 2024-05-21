import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../trpc.js";
import {
  hubs,
  profilesToHubs,
  NewMessage,
  profiles,
  missionSubmissions,
  missionParticipants,
  chatMessages,
} from "../db/schema/schema.js";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({ chatId: z.string(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { chatId, message } = input;
      const chat = await ctx.db.query.chats.findFirst({
        where: (chat, { eq }) => eq(chat.id, chatId),
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      const profile = await ctx.db.query.profiles.findFirst({
        where: (profile, { eq }) => eq(profile.userId, ctx.user.id),
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User Profile not found",
        });
      }

      try {
        return await ctx.db
          .insert(chatMessages)
          .values({
            chatId: chat.id,
            message: message,
            profileId: profile.id,
          })
          .returning();
        // return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  getMessages: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.query.chats.findFirst({
        where: (hub, { eq }) => eq(hub.id, input.chatId),
        with: {},
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      return await ctx.db.query.chatMessages.findMany({
        where: (message, { eq }) => eq(message.chatId, input.chatId),
        orderBy: (message, { asc }) => asc(message.sentAt),
        with: {
          profile: {
            columns: {
              id: true,
              username: true,
              xp: true,
            },
          },
        },
      });
      // TODO: Add pagination
    }),
});
