import type { User } from "@supabase/supabase-js";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { LogIn, LogOut, UserCircle2 } from "lucide-react";
import {
  useSession,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ProfileLevel from "./ProfileLevel";
import { trpc } from "../services";

const HeaderAuth = () => {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const user = useUser();
  const client = useSupabaseClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  return (
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
      {user ? (
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
      ) : (
        <DropdownMenuContent>
          <DropdownMenuLabel>Guest</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <Link
              href="/login"
              className="flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Log In</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href="/register"
              className="flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Register</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default HeaderAuth;
