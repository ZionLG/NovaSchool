import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { AppRouter, appRouter } from "./root";
import { createContext } from "./trpc";
import cors from "cors";
import { db } from "../src/db/index";
import { User, users, NewUser } from "../src/db/schema/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import supertokens from "supertokens-node";
import { middleware } from "supertokens-node/framework/express";
import { errorHandler } from "supertokens-node/framework/express";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
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

supertokens.init({
  framework: "express",
  supertokens: {
    apiKey: process.env.SUPERTOKENS_API_SECRET,
    connectionURI:
      "https://st-dev-19df76f0-94de-11ee-b69f-4b9a7540ca1c.aws.supertokens.io",
  },
  appInfo: {
    appName: "trpc-auth",
    apiDomain: "http://localhost:4000",
    websiteDomain: "http://localhost:3000",
    apiBasePath: "/api/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [EmailPassword.init(), Session.init()],
});

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);
app.use(middleware());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
app.use(errorHandler());

app.listen(4000);

migrate(db, { migrationsFolder: "drizzle" });
