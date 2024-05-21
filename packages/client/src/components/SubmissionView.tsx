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
import type { RouterOutput } from "api/src/root";
type submissionOutput =
  RouterOutput["mission"]["getMissionSubmissions"][number];

const SubmissionView = (submission: submissionOutput) => {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: participants } = trpc.user.getProfiles.useQuery({
    profileIds: submission.participants.map((p) => p.profileId),
  });
  const utils = trpc.useUtils();
  const { mutate, isPending } = trpc.mission.changeSubmissionStatus.useMutation(
    {
      onSuccess: () => {
        toast.success("Submission status updated");
        utils.user.getProfile.invalidate();
        utils.mission.getMissionSubmissions.invalidate();
        utils.chat.getMessages.invalidate();
      },
    }
  );

  const client = useSupabaseClient();
  const [link, setLink] = useState<null | string>(null);
  useEffect(() => {
    if (submission.proofUrl) {
      const url = client.storage
        .from("submits")
        .getPublicUrl(submission.proofUrl);
      setLink(url.data.publicUrl);
    }
  }, [client]);

  if (profile?.isAdmin && participants && submission.proofUrl)
    return (
      <div className="flex gap-5 justify-between rounded-md border px-4 py-3 font-mono text-sm">
        <div>
          <a href={link ?? ""} target="_blank" rel="noopener noreferrer">
            Proof
          </a>
          <div className="flex gap-2">
            {participants.map((p) => p.username).join(", ")}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant={"default"}
            size={"sm"}
            disabled={isPending}
            onClick={() => {
              mutate({
                submissionId: submission.id,
                status: "Approved",
              });
            }}
          >
            Approve
          </Button>
          <Button
            variant={"destructive"}
            size={"sm"}
            disabled={isPending}
            onClick={() => {
              mutate({
                submissionId: submission.id,
                status: "Declined",
              });
            }}
          >
            Decline
          </Button>
        </div>
      </div>
    );

  return null;
};

export default SubmissionView;
