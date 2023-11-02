import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { AppRouter, appRouter } from "./root";
import { createContext } from "./trpc";
import cors from "cors";
import { db } from "../src/db/index";
import { User, users, NewUser } from "../src/db/schema/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// no context
/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

const app = express();
app.use(cors());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(4000);

migrate(db, { migrationsFolder: "drizzle" });
