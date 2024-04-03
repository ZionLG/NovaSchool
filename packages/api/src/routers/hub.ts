import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc.js";
import { hubs } from "../db/schema/schema.js";
import { eq } from "drizzle-orm";

export const hubRouter = createTRPCRouter({
  allHubs: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(hubs);
  }),
  hubById: publicProcedure
    .input(z.object({ hubId: z.number() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(hubs)
        .where(eq(hubs.id, input.hubId));
      return result[0];
    }),
});
