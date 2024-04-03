import { Inter } from "next/font/google";
import { helpers } from "../services/ssg";
import HubCard from "../components/HubCard";
import { InferGetStaticPropsType } from "next";
import { trpc } from "../services";

const inter = Inter({ subsets: ["latin"] });

export async function getStaticProps() {
  await helpers.hub.allHubs.prefetch();
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 60,
  };
}

export default function Home() {
  const postQuery = trpc.hub.allHubs.useQuery();
  if (postQuery.status !== "success") {
    return <>Loading...</>;
  }
  const { data } = postQuery;
  return (
    <main
      className={`flex min-h-screen flex-col items-center gap-5 px-24  ${inter.className}`}
    >
      <h1 className="text-primary text-5xl font-bold py-10">Welcome to Nova</h1>
      <div className="grid lg:grid-cols-2   xl:grid-cols-3 grid-cols-1 gap-16">
        {data.map((hub) => {
          return (
            <HubCard
              className="flex flex-col justify-between"
              {...hub}
              key={hub.id}
            />
          );
        })}
      </div>
    </main>
  );
}
