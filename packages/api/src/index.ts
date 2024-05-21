import cors from "@fastify/cors";
import ws from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";

import { createContext } from "./context.js";
import { appRouter } from "./root.js";

const server = fastify({
  maxParamLength: 5000,
});
void server.register(cors, {
  origin: (origin, cb) => {
    console.log(origin);
    const hostname = new URL(origin ?? "").hostname;
    console.log(hostname);

    if (hostname === "localhost") {
      //  Request from localhost will pass
      cb(null, true);
      return;
    }
    // Generate an error on other origins, disabling access
    cb(new Error("Not allowed"), false);
  },
  methods: ["*"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
});

void server.register(ws);

void server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  useWSS: true,
  trpcOptions: { router: appRouter, createContext },
});

void (async () => {
  try {
    await server.listen({ port: 4000 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
