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
import { ChevronsUpDown, Plus, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import SubmissionView from "./SubmissionView";

const MissionSubmissionView = ({
  missionId,
  missionTitle,
}: {
  missionId: string;
  missionTitle: string;
}) => {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: submissions } = trpc.mission.getMissionSubmissions.useQuery({
    missionId,
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const utils = trpc.useUtils();
  if (profile?.isAdmin && submissions)
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">{missionTitle} Submissions</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        {submissions[0] && <SubmissionView {...submissions[0]} />}
        <CollapsibleContent className="space-y-2">
          {submissions.slice(1).map((submission) => (
            <SubmissionView {...submission} key={submission.id} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );

  return null;
};

export default MissionSubmissionView;
