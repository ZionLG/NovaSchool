import "../src/styles/global.css";
import { AppProps } from "next/app";
import { useState } from "react";
import {QueryClient,  QueryClientProvider } from "@tanstack/react-query";
import { client, trpc } from "../src/services";
import { httpBatchLink } from "@trpc/react-query";

const App = ({ Component, pageProps }: AppProps) => {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4000/trpc'       
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default App;
