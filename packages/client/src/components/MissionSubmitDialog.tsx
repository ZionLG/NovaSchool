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

const MissionSubmitDialog = ({
  mission,
  disabled,
}: {
  mission: Mission;
  disabled: boolean;
}) => {
  const { description, title } = mission;
  const supabase = useSupabaseClient();
  const [file, setFile] = useState<File | null>(null);
  const user = useUser();
  const utils = trpc.useUtils();
  const { mutate, isPending } = trpc.mission.addSubmission.useMutation({
    onSuccess: () => {
      utils.mission.getHubMissions.invalidate({ hubId: mission.hubId });
      utils.user.getProfile.invalidate();
      utils.chat.getMessages.invalidate();
    },
  });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files ? event.target.files[0] : null);
  };
  useEffect(() => {
    if (file) {
      console.log(file);
    }
  }, [file]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (file && user) {
      const { error } = await supabase.storage
        .from("submits")
        .upload(`${title}-${user.id}`, file);
      if (error) {
        console.error("File upload error:", error);
      } else {
        console.log("File uploaded successfully");
        mutate({ missionId: mission.id });
        toast.success("Mission submitted successfully");
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size={"sm"} disabled={disabled}>
          Submit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="sumbitFile">File</Label>
              <Input id="sumbitFile" type="file" onChange={handleFileChange} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || disabled}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MissionSubmitDialog;
