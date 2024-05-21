import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserCircle2, LogOut } from "lucide-react";
import router, { useRouter } from "next/router";
import { ThemeToggle } from "./ThemeToggle";
import { Separator } from "./ui/separator";
import { trpc } from "../services";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import ProfileLevel from "./ProfileLevel";

const BottomBar = () => {
  const user = useUser();
  const { data: profile } = trpc.user.getProfile.useQuery();
  const client = useSupabaseClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const { data } = trpc.user.getUserHub.useQuery();
  const router = useRouter();

  if (!user || !data) return null;
  return (
    <div className="p-5 bg-neutral-900 sticky bottom-0 flex items-center gap-2">
      <span
        className="text-3xl tracking-widest cursor-pointer"
        onClick={() => {
          router.push(`/`);
        }}
      >
        Nova
      </span>
      <DropdownMenu open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DropdownMenuTrigger className="outline-none">
          {profile ? (
            <div className={`pt-1 pl-1 relative`}>
              <Avatar
                className={`cursor-pointer group-hover:rounded-sm ${isOpen && "rounded-sm"}`}
              >
                <AvatarImage src="" alt={profile.username} />
                <AvatarFallback
                  className={`group-hover:rounded-sm ${isOpen && "rounded-sm"}`}
                >
                  {profile.username[0]}
                </AvatarFallback>
              </Avatar>
              <ProfileLevel
                level={Math.floor(profile.xp / 100) + 1}
                levelClasses={{
                  1: "-bottom-2 -right-2",
                  2: "-bottom-2 -right-3",
                  3: "-bottom-2 -right-4",
                  4: "-bottom-2 -right-4",
                  5: "-bottom-2 -right-4",
                  6: "-bottom-2 -right-4",
                }}
              />
            </div>
          ) : (
            <UserCircle2 strokeWidth={1} size={36} opacity={isOpen ? 0.5 : 1} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            {user.user_metadata.username} - {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await client.auth.signOut();
              router.push("/");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="h-6 w-[0.1rem] ml-5" />
      {data.map(({ hub, joinedAt }) => (
        <TooltipProvider delayDuration={50} key={hub.id}>
          <Tooltip>
            <TooltipTrigger asChild className="group">
              <Avatar
                key={hub.id}
                onClick={() => {
                  router.push(`/hub/${encodeURIComponent(hub.hubName)}`);
                }}
                className="cursor-pointer group-hover:rounded-none"
              >
                <AvatarImage src="" alt={hub.hubName} />
                <AvatarFallback className="group-hover:rounded-none">
                  {hub.hubName[0]}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{hub.hubName}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default BottomBar;
