import React from "react";
import { trpc } from "../services";
import { Separator } from "./ui/separator";
import MissionSubmitDialog from "./MissionSubmitDialog";
import { Button } from "./ui/button";
import MissionSubmissionsDialog from "./MissionSubmissionsDialog";

const Missions = ({ hubId }: { hubId: string }) => {
  const { data: missions } = trpc.mission.getHubMissions.useQuery({ hubId });
  const { data: profile } = trpc.user.getProfile.useQuery();
  return (
    <div className="w-72 border rounded-lg p-5 mb-5 mr-3 flex flex-col gap-5 overflow-y-auto h-[49rem]">
      <MissionSubmissionsDialog hubId={hubId} />
      <div>Missions</div>
      {missions
        ?.sort((a, b) => a.hasParticipation - b.hasParticipation)
        .map((mission) => (
          <div key={mission.id} className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="font-bold">{mission.title}</span>
              <span>{mission.description}</span>
            </div>
            <MissionSubmitDialog
              mission={{ ...mission, hubId }}
              disabled={mission.hasParticipation}
            />

            <Separator />
          </div>
        ))}
    </div>
  );
};

export default Missions;
