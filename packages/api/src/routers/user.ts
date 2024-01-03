import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import { users } from "../db/schema/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  allUsers: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(users);
  }),
  getSession: authenticatedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.session.userId,
    };
  }),
  userById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      return result[0];
    }),
  createUser: publicProcedure
    .input(
      z.object({ userFullName: z.string(), userPhone: z.string().optional() })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .insert(users)
        .values({
          fullName: input.userFullName,
          phone: input.userPhone,
          email: "",
          hashedPassword: "",
        })
        .returning();
    }),
  deleteUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.delete(users).where(eq(users.id, input.userId));
    }),
});
