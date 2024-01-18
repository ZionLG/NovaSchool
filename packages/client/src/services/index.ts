import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "api/src/root";

import { QueryClient } from "@tanstack/react-query";

export const trpc = createTRPCReact<AppRouter>();

export const client = new QueryClient();
