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

const HeaderAuth = () => {
  const user = useUser();
  const client = useSupabaseClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger className="outline-none">
        <UserCircle2 strokeWidth={1} size={36} opacity={isOpen ? 0.5 : 1} />
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
