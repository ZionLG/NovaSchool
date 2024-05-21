import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { trpc } from "../services";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { CalendarDays, Send } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ProfileLevel from "./ProfileLevel";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Progress } from "./ui/progress";

const Chat = ({ chatId }: { chatId: string }) => {
  const user = useUser();

  const utils = trpc.useUtils();
  const { data: profile } = trpc.user.getProfile.useQuery();
  const [message, setMessage] = useState("");
  const { data: messages } = trpc.chat.getMessages.useQuery(
    { chatId: chatId! },
    {
      enabled: !!chatId,
    }
  );
  const { mutate, isPending, variables } = trpc.chat.sendMessage.useMutation({
    onSettled: async () => {
      return await utils.chat.getMessages.invalidate({ chatId: chatId! });
    },
    onSuccess: () => {
      setMessage("");
    },
  });
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView(false);
  };

  const mountedRef = useRef(false);

  useEffect(() => {
    if (messages && !mountedRef.current) {
      scrollToBottomInstant();
      mountedRef.current = true;
    }
  }, [messages]);
  useEffect(() => {
    scrollToBottom();
  }, [variables]);
  function calculateProgress(xp: number) {
    const maxLevel = 6;
    const xpPerLevel = 100;
    const currentLevel = Math.min(Math.floor(xp / xpPerLevel), maxLevel);
    const xpForNextLevel = (currentLevel + 1) * xpPerLevel;
    const xpForCurrentLevel = currentLevel * xpPerLevel;
    const progress =
      ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    return Math.min(progress, 100); // Ensure progress doesn't exceed 100%
  }
  return (
    <div className="flex grow flex-col h-full max-h-full justify-between">
      <div className="flex flex-col gap-5 overflow-y-scroll grow h-96 pr-3  justify-between">
        <div className="flex flex-col">
          {messages?.map((message, i) => (
            <div
              key={message.id}
              className={`flex ${messages[i - 1]?.profileId !== message.profileId && i !== 0 ? "py-1 mt-3" : "py-1"} rounded-md hover:bg-gray-900`}
            >
              <div
                className={`pt-1 pl-1 relative ${!(messages[i - 1]?.profileId !== message.profileId) && "invisible h-0"}`}
              >
                <Avatar className="cursor-pointer group-hover:rounded-none">
                  <AvatarImage src="" alt={message.profile.username} />
                  <AvatarFallback className="group-hover:rounded-none">
                    {message.profile.username[0]}
                  </AvatarFallback>
                </Avatar>
                <ProfileLevel
                  level={Math.floor(message.profile.xp / 100) + 1}
                />
              </div>

              <div key={message.id} className={`flex flex-col gap-1 px-3 `}>
                {messages[i - 1]?.profileId !== message.profileId && (
                  <div className=" cursor-default flex items-center gap-2">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="font-bold text-lg">
                          {message.profile.username}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <div className={`pt-1 pl-1 relative h-14`}>
                            <Avatar>
                              <AvatarImage
                                src=""
                                alt={message.profile.username}
                              />
                              <AvatarFallback>
                                {message.profile.username[0]}
                              </AvatarFallback>
                            </Avatar>
                            <ProfileLevel
                              level={Math.floor(message.profile.xp / 100) + 1}
                            />
                          </div>

                          <div className="flex flex-col w-full gap-2">
                            <h4 className="text-sm font-semibold">
                              {message.profile.username} - {message.profile.xp}
                              xp
                            </h4>
                            <Progress
                              value={calculateProgress(message.profile.xp)}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>

                    <span className="opacity-75 text-sm self-center">
                      {message.sentAt.toLocaleDateString("he-IL")} At{" "}
                      {message.sentAt.toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <div>{message.message}</div>
              </div>
            </div>
          ))}
          {isPending && profile && (
            <div className="flex gap-1 py-1 mt-3 px-3 rounded-md hover:bg-gray-900 opacity-50">
              <div className={`pt-1 pl-1 relative`}>
                <Avatar className="cursor-pointer group-hover:rounded-none">
                  <AvatarImage src="" alt={profile.username} />
                  <AvatarFallback className="group-hover:rounded-none">
                    {profile.username[0]}
                  </AvatarFallback>
                </Avatar>
                <ProfileLevel level={Math.floor(profile.xp / 100) + 1} />
              </div>

              <div className={`flex flex-col gap-1 px-3 `}>
                <div className=" cursor-default flex items-center gap-2">
                  <span className="font-bold text-lg">{profile.username}</span>{" "}
                  <span className="opacity-75 text-sm self-center">
                    {new Date().toLocaleDateString("he-IL")} At{" "}
                    {new Date().toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>{variables.message}</div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className=" p-4 my-5 rounded-md bg-neutral-900 flex gap-2">
        <Input
          className="bg-neutral-900 w-full focus-visible:ring-offset-0"
          onKeyDown={(event) => {
            if (!message || !chatId || isPending) return;
            if (event.key === "Enter") {
              mutate({ chatId: chatId, message });
            }
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          variant={"outline"}
          disabled={!message || !chatId || isPending}
          className="bg-neutral-900"
          onClick={() => mutate({ chatId: chatId, message })}
        >
          <Send />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
