import React from "react";
import Image from "next/image";
import { cn } from "../../@/lib/utils";

const ProfileLevel = ({
  level,
  className,
  levelClasses,
}: {
  level: number;
  className?: string;
  levelClasses?: { [key: number]: string };
}) => {
  const levelClass = levelClasses ? levelClasses[level] : "";
  if (level === 1)
    return (
      <Image
        src="/levelOne.png"
        alt="level"
        className={cn("absolute bottom-1 -right-1", levelClass, className)}
        width={24}
        height={24}
        quality={100}
      />
    );
  if (level === 2)
    return (
      <Image
        src="/levelTwo.png"
        alt="level"
        className={cn(
          "self-start absolute bottom-0 -right-2",
          levelClass,
          className
        )}
        width={28}
        height={28}
        quality={100}
      />
    );
  if (level === 3)
    return (
      <Image
        src="/levelThree.png"
        alt="level"
        className={cn(
          "self-start absolute -bottom-1 -right-2",
          levelClass,
          className
        )}
        width={32}
        height={32}
        quality={100}
      />
    );
  if (level === 4)
    return (
      <Image
        src="/levelFour.png"
        alt="level"
        className={cn(
          "self-start absolute -bottom-1 -right-2",
          levelClass,
          className
        )}
        width={32}
        height={32}
        quality={100}
      />
    );
  if (level === 5)
    return (
      <Image
        src="/levelFive.png"
        alt="level"
        className={cn(
          "self-start absolute -bottom-1 -right-2",
          levelClass,
          className
        )}
        width={32}
        height={32}
        quality={100}
      />
    );
  if (level === 6)
    return (
      <Image
        src="/levelSix.png"
        alt="level"
        className={cn(
          "self-start absolute -bottom-1 -right-2",
          levelClass,
          className
        )}
        width={32}
        height={32}
        quality={100}
      />
    );
  return <div>UnknownLevel</div>;
};

export default ProfileLevel;
