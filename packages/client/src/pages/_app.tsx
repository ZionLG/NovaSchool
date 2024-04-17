import "../styles/global.css";
import { AppProps } from "next/app";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "../services";
import { httpBatchLink } from "@trpc/react-query";
import Layout from "../components/layout";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { env } from "../env.mjs";
import { type Session } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import superjson from "superjson";
import { Toaster } from "../components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const App = ({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session | null }>) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,

      links: [
        httpBatchLink({
          url: "http://localhost:4000/trpc",
          async headers() {
            return {
              Authorization:
                "Bearer " +
                (await supabaseClient.auth.getSession()).data?.session
                  ?.access_token,
            };
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );
  const [supabaseClient] = useState(() =>
    createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_ANON_KEY)
  );
  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryDevtools initialIsOpen={false} />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
          <Toaster />
        </QueryClientProvider>
      </trpc.Provider>
    </SessionContextProvider>
  );
};

export default App;
