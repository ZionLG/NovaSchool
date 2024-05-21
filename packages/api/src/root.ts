import { createTRPCRouter } from "./trpc.js";
import { hubRouter } from "./routers/hub.js";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { chatRouter } from "./routers/chat.js";
import { missionRouter } from "./routers/mission.js";
import { userRouter } from "./routers/user.js";

export const appRouter = createTRPCRouter({
  hub: hubRouter,
  chat: chatRouter,
  mission: missionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
