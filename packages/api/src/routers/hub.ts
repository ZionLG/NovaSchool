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
  chatMessages,
} from "../db/schema/schema.js";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const hubRouter = createTRPCRouter({
  allHubs: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(hubs);
  }),
  hubById: publicProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.hubs.findFirst({
        where: (hub, { eq }) => eq(hub.id, input.hubId),
      });

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hub not found",
        });
      }

      return result;
    }),
  hubByName: publicProcedure
    .input(z.object({ hubName: z.string() }))
    .query(async ({ ctx, input }) => {
      const hub = await ctx.db.query.hubs.findFirst({
        where: (hub, { eq }) => eq(hub.hubName, input.hubName),
      });

      if (!hub) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hub not found",
        });
      }

      const chat = await ctx.db.query.chats.findFirst({
        where: (chat, { eq }) => eq(chat.hubId, hub.id),
      });

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      return {
        hub,
        chat,
      };
    }),
  getUserHub: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.profiles.findFirst({
      where: (profile, { eq }) => eq(profile.userId, ctx.user.id),
      with: {
        profilesToHubs: {
          columns: {
            joinedAt: true,
          },
          with: {
            hub: {
              columns: {
                id: true,
                hubName: true,
                hubDescription: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User Profile not found",
      });
    }

    return profile.profilesToHubs;
  }),

  joinHub: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
        const [data] = await ctx.db
          .insert(profilesToHubs)
          .values({
            profileId: profile.id,
            hubId: input.hubId,
          })
          .returning();
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

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
        const [data] = await ctx.db
          .insert(chatMessages)
          .values({
            chatId: chat.id,
            message: message,
            profileId: profile.id,
          })
          .returning();
        return data;
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

      const messages = await ctx.db.query.chatMessages.findMany({
        where: (message, { eq }) => eq(message.chatId, input.chatId),
        orderBy: (message, { asc }) => asc(message.sentAt),
        with: {
          profile: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      });
      // TODO: Add pagination
      return messages;
    }),

  getHubUsers: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ ctx, input }) => {
      const hub = await ctx.db.query.hubs.findFirst({
        where: (hub, { eq }) => eq(hub.id, input.hubId),
        with: {
          profilesToHubs: {
            with: {
              profile: {
                columns: {
                  id: true,
                  userId: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      if (!hub) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hub not found",
        });
      }

      return hub.profilesToHubs.map((profileToHub) => profileToHub.profile);
    }),
});
