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

export const hubRouter = createTRPCRouter({
  allHubs: publicProcedure.query(async ({ ctx }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

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

  newHub: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      try {
        const [data] = await ctx.db
          .insert(hubs)
          .values({
            hubName: name,
          })
          .returning();
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
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
