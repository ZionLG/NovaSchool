import React, { useCallback, useState } from "react";
import { trpc } from "../services";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import { Send } from "lucide-react";

const Chat = ({ chatId }: { chatId: string }) => {
  const utils = trpc.useUtils();

  const [message, setMessage] = useState("");
  const { data: messages } = trpc.hub.getMessages.useQuery(
    { chatId: chatId! },
    {
      enabled: !!chatId,
    }
  );
  const { mutate, isPending, variables } = trpc.hub.sendMessage.useMutation({
    onSettled: async () => {
      return await utils.hub.getMessages.invalidate({ chatId: chatId! });
    },
    onSuccess: () => {
      setMessage("");
    },
  });
  const user = useUser();
  if (messages)
    return (
      <div className="flex grow flex-col h-full justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex flex-col gap-1 p-3 rounded-md border"
              >
                <div className="underline">{message.profile.username}</div>
                <div>{message.message}</div>
              </div>
            ))}
            {isPending && (
              <div className="flex flex-col gap-1 p-3 rounded-md border opacity-50">
                <div className="underline">{user?.user_metadata.username}</div>
                <div>{variables.message}</div>
              </div>
            )}
          </div>
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
