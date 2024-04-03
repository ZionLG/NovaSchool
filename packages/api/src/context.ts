/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import db from "./db/index.js";
import type { User } from "@supabase/supabase-js";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";
/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
interface CreateInnerContextOptions
  extends Partial<CreateFastifyContextOptions> {
  user: User | null;
}
/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock `req`/`res`
 * - tRPC's `createServerSideHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export function createContextInner(_opts?: CreateInnerContextOptions) {
  const serverClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );
  return {
    serverClient,
    db,
  };
}

export async function createContext({ req }: CreateFastifyContextOptions) {
  const contextInner = createContextInner();
  const token = req.headers.authorization ?? "";
  const response = await contextInner.serverClient.auth.getUser(
    token.split(" ")[1]
  );

  const user = response.data.user ?? undefined;

  return {
    ...contextInner,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
