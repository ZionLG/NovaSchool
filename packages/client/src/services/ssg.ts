import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { AppRouter } from "api/src/root";
import superjson from "superjson";
const proxyClient = createTRPCClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: "http://localhost:4000/trpc",
    }),
  ],
});
export const helpers = createServerSideHelpers({
  client: proxyClient,
  transformer: superjson,
});
