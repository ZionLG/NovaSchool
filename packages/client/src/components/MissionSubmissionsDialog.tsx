import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mission } from "api/src/db/schema/schema";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { trpc } from "../services";
import { toast } from "sonner";
import MissionSubmissionView from "./MissionSubmissionView";

const MissionSubmissionsDialog = ({ hubId }: { hubId: string }) => {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: missions } = trpc.mission.getHubMissions.useQuery({ hubId });
  const utils = trpc.useUtils();
  if (profile?.isAdmin)
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full" size={"sm"}>
            Submissions
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <span>Users Submissions</span>
          <div className="flex flex-col gap-3">
            {missions?.map((mission) => (
              <MissionSubmissionView
                key={mission.id}
                missionTitle={mission.title}
                missionId={mission.id}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );

  return null;
};

export default MissionSubmissionsDialog;
