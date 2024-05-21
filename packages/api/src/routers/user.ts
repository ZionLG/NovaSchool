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

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.profiles.findFirst({
      where: (profile, { eq }) => eq(profile.userId, ctx.user.id),
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User Profile not found",
      });
    }

    return profile;
  }),

  getProfiles: protectedProcedure
    .input(z.object({ profileIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.profiles.findMany({
        where: (profile, { inArray }) => inArray(profile.id, input.profileIds),
      });
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
});
