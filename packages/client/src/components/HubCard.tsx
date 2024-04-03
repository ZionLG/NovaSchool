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
type PostCreateOutput = RouterOutput["hub"]["allHubs"][number];

type HubCardProps = PostCreateOutput & {
  className?: string;
};
const HubCard = ({ hubName, hubDescription, id, className }: HubCardProps) => {
  return (
    <Card className={cn("w-[380px]", className)}>
      <CardHeader>
        <CardTitle>{hubName} Hub</CardTitle>
      </CardHeader>
      <CardContent>{hubDescription}</CardContent>
      <CardFooter>
        <Button className="w-full">Join</Button>
      </CardFooter>
    </Card>
  );
};

export default HubCard;
