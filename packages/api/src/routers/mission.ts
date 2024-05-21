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
import { eq, sql, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const missionRouter = createTRPCRouter({
  addSubmission: protectedProcedure
    .input(z.object({ missionId: z.string() }))
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

      const mission = await ctx.db.query.missions.findFirst({
        where: (mission, { eq }) => eq(mission.id, input.missionId),
      });

      if (!mission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mission not found",
        });
      }

      try {
        const [missionSubmission] = await ctx.db
          .insert(missionSubmissions)
          .values({
            missionId: mission.id,
            proofUrl: `${mission.title}-${ctx.user.id}`,
            status: "PendingApproval",
          })
          .returning();

        await ctx.db.insert(missionParticipants).values({
          profileId: profile.id,
          submissionId: missionSubmission.id,
        });

        await ctx.db.update(profiles).set({ xp: profile.xp + 50 });
        return missionSubmission;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),

  getHubMissions: protectedProcedure
    .input(z.object({ hubId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.query.profiles.findFirst({
        where: (profile, { eq }) => eq(profile.userId, ctx.user.id),
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User Profile not found",
        });
      }

      const hub = await ctx.db.query.hubs.findFirst({
        where: (hub, { eq }) => eq(hub.id, input.hubId),
        with: {
          missions: {
            columns: { id: true, title: true, description: true },
            with: {
              submissions: {
                columns: { id: true },
                with: {
                  participants: {
                    columns: { profileId: true },
                  },
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

      const missions = hub.missions.map((mission) => {
        const hasParticipation = mission.submissions.some((submission) =>
          submission.participants.some(
            (participant) => participant.profileId === profile.id
          )
        );
        return {
          title: mission.title,
          description: mission.description,
          id: mission.id,
          hasParticipation,
        };
      });

      return missions;
    }),

  getMissionSubmissions: protectedProcedure
    .input(z.object({ missionId: z.string() }))
    .query(async ({ ctx, input }) => {
      // const profile = await ctx.db.query.profiles.findFirst({
      //   where: (profile, { eq }) => eq(profile.userId, ctx.user.id),
      // });

      // if (!profile) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: "User Profile not found",
      //   });
      // }

      const mission = await ctx.db.query.missions.findFirst({
        where: (mission, { eq }) => eq(mission.id, input.missionId),
        with: {
          submissions: {
            where: (submission, { eq }) =>
              eq(submission.status, "PendingApproval"),
            with: {
              participants: true,
              // where: (participant, { eq }) =>
              //   eq(participant.profileId, profile.id),
            },
          },
        },
      });

      if (!mission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Mission not found",
        });
      }

      return mission.submissions;
    }),

  changeSubmissionStatus: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        status: z.enum(["Approved", "Declined"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.db.query.missionSubmissions.findFirst({
        where: (submission, { eq }) => eq(submission.id, input.submissionId),
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission not found",
        });
      }

      const updated = await ctx.db
        .update(missionSubmissions)
        .set({ status: input.status })
        .where(eq(missionSubmissions.id, submission.id))
        .returning();

      if (updated[0].status === "Approved") {
        const participants = await ctx.db.query.missionParticipants.findMany({
          where: (participant, { eq }) =>
            eq(participant.submissionId, submission.id),
          with: {
            profile: true,
          },
        });

        const profileIds = participants.map(
          (participant) => participant.profileId
        );
        await ctx.db
          .update(profiles)
          .set({ xp: sql`${profiles.xp} + 100` })
          .where(inArray(profiles.id, profileIds));
      }

      return submission;
    }),
});
