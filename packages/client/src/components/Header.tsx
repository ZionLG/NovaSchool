import React from "react";
import Link from "next/link";

import { ThemeToggle } from "./ThemeToggle";

import { Button, buttonVariants } from "./ui/button";
import { Dot } from "lucide-react";
import { cn } from "../../@/lib/utils";
const Header = () => {
  const navUser = (
    <>
      <nav className=" flex gap-5 text-lg text-foreground">
        <Link href="/">Home</Link>
        <Link href="/">Explore</Link>
      </nav>
      <div className="flex items-center">
        <Dot className="mx-2" />
        <div className="flex gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Sign In
          </Link>

          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
  return (
    <>
      <header className=" top-0 z-50 flex flex-col items-center gap-5 bg-background p-5 text-foreground md:flex-row  md:gap-0">
        <div>
          <span className="mr-5 text-3xl tracking-widest">Nova</span>
          <ThemeToggle />
        </div>
        <div className="  hidden md:static md:ml-auto md:flex md:items-center">
          {navUser}
        </div>
      </header>
      <div className="sticky top-0 z-50 flex  items-center justify-center bg-background p-3 md:hidden ">
        {navUser}
      </div>
    </>
  );
};

export default Header;
