import { Inter } from "next/font/google";

import { Button } from "../components/ui/button";
import HubCard from "../components/HubCard";

const inter = Inter({ subsets: ["latin"] });

const HubData = [
  {
    hubName: "History",
    hubDescription:
      "History Hub is your place to talk about historical battles, nations, events and more!",
    hubId: "0",
  },
  {
    hubName: "Art",
    hubDescription: "Unlock your true passion!",
    hubId: "1",
  },
  {
    hubName: "Studies",
    hubDescription: "Learn and improve yourself, or just copy your homework.",
    hubId: "2",
  },
  {
    hubName: "Gaming",
    hubDescription: "Hardcore playing all day and night!",
    hubId: "3",
  },
  {
    hubName: "Geography",
    hubDescription: "The earth is pretty neat when you get to know it.",
    hubId: "4",
  },
  {
    hubName: "Politics",
    hubDescription: "Don't show this hub in your family reunion.",
    hubId: "5",
  },
  {
    hubName: "Music",
    hubDescription: "Hear it all day long.",
    hubId: "6",
  },
  {
    hubName: "Other",
    hubDescription: "Anything else?",
    hubId: "7",
  },
];

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center gap-5 px-24  ${inter.className}`}
    >
      <h1 className="text-primary text-5xl font-bold py-10">Welcome to Nova</h1>
      <div className="grid lg:grid-cols-2   xl:grid-cols-3 grid-cols-1 gap-16">
        {HubData.map((hub) => {
          return (
            <HubCard
              className="flex flex-col justify-between"
              {...hub}
              key={hub.hubId}
            />
          );
        })}
      </div>
    </main>
  );
}
