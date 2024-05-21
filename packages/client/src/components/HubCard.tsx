import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "../../@/lib/utils";
import { RouterOutput } from "api/src/root";
import { trpc } from "../services";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
type PostCreateOutput = RouterOutput["hub"]["allHubs"][number];

type HubCardProps = PostCreateOutput & {
  className?: string;
};
const HubCard = ({ hubName, hubDescription, id, className }: HubCardProps) => {
  const utils = trpc.useUtils();
  const { mutate, isPending } = trpc.hub.joinHub.useMutation({
    onSuccess: () => {
      utils.user.getUserHub.invalidate();
    },
  });
  const user = useUser();
  const { data } = trpc.user.getUserHub.useQuery(undefined, {
    enabled: !!user,
  });
  const router = useRouter();
  return (
    <Card className={cn("w-[380px]", className)}>
      <CardHeader>
        <CardTitle>{hubName} Hub</CardTitle>
      </CardHeader>
      <CardContent>{hubDescription}</CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isPending || !data}
          onClick={() => {
            if (!data) return;
            if (data.some((hubUser) => hubUser.hub.id === id)) {
              router.push(`/hub/${encodeURIComponent(hubName)}`);
              return;
            }
            mutate({ hubId: id });
          }}
        >
          Join
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HubCard;
