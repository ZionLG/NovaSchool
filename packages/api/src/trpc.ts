import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { createContext } from "./context.js";

const trpc = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = trpc.router;
export const middleware = trpc.middleware;
export const publicProcedure = trpc.procedure;
export const createCallerFactory = trpc.createCallerFactory;
const enforceUserIsAuthed = trpc.middleware(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

export const protectedProcedure = trpc.procedure.use(enforceUserIsAuthed);
