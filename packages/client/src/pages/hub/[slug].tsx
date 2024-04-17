import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "../../services";
import { useRouter } from "next/router";
import { Input } from "../../components/ui/input";
import { Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

function HubPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [message, setMessage] = useState("");
  const { data } = trpc.hub.hubByName.useQuery(
    {
      hubName: router.query.slug?.toString() ?? "",
    },
    { enabled: !!router.query.slug }
  );
  const chatId = data?.chat.id;
  const hubId = data?.hub.id;
  const user = useUser();
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user]);

  const { data: users } = trpc.hub.getHubUsers.useQuery(
    { hubId: hubId! },
    {
      enabled: !!data,
    }
  );
  const [presentIds, setPresentIds] = useState([] as string[]);
  const offlineUsers = users
    ?.map((user) => user)
    .filter((user) => !presentIds.includes(user.userId));
  const onlineUsers = users
    ?.map((user) => user)
    .filter((user) => presentIds.includes(user.userId));

  const { data: messages } = trpc.hub.getMessages.useQuery(
    { chatId: chatId! },
    {
      enabled: !!chatId,
    }
  );
  const { mutate, isPending, variables } = trpc.hub.sendMessage.useMutation({
    onSettled: async () => {
      return await utils.hub.getMessages.invalidate({ chatId: chatId });
    },
    onSuccess: () => {
      setMessage("");
    },
  });

  const handleSendMessage = useCallback(() => {
    if (chatId) {
      mutate({ chatId: chatId, message });
    }
  }, [chatId, message]);
  const client = useSupabaseClient();
  React.useEffect(() => {
    //console.log("subscribing to order updates dashboard");
    //
    if (chatId && user && hubId) {
      const chat = client.channel(`${chatId}-presence`);

      chat
        .on("presence", { event: "sync" }, () => {
          const newState = chat.presenceState();

          /** transform the presence */
          const users = Object.keys(newState)
            .map((presenceId) => {
              const presences = newState[presenceId] as unknown as {
                id: string;
              }[];
              return presences.map((presence) => presence.id);
            })
            .flat();
          setPresentIds(users);
          console.log("sync", newState);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("join", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            chat.track({ id: user.id });
          }
        });

      const newMessage = client
        .channel("new_message")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            console.log("new message", payload);

            void utils.hub.getMessages.invalidate({
              chatId: chatId,
            });
          }
        )
        .subscribe();

      const userJoined = client
        .channel("user_joined_hub")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "profiles_to_hubs",
            filter: `hub_id=eq.${hubId}`,
          },
          (payload) => {
            console.log("new user", payload);

            void utils.hub.getHubUsers.invalidate({
              hubId,
            });
          }
        )
        .subscribe();
      return () => {
        //console.log("unsubscribing to order updates");
        void client.removeChannel(chat);
        void client.removeChannel(newMessage);
        void client.removeChannel(userJoined);
      };
    }
  }, [client, chatId, hubId]);
  if (data)
    return (
      <div className="container pt-16 flex h-full">
        <div className="w-72"></div>
        <div className="flex grow flex-col h-full justify-between">
          <div className="flex flex-col gap-5">
            <div>{data.hub.hubName} Chat</div>
            <div className="flex flex-col gap-2">
              {messages?.map((message) => (
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
                  <div className="underline">
                    {user?.user_metadata.username}
                  </div>
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
                  handleSendMessage();
                }
              }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant={"outline"}
              disabled={!message || !chatId || isPending}
              className="bg-neutral-900"
              onClick={handleSendMessage}
            >
              <Send />
            </Button>
          </div>
        </div>
        <div className="w-48 flex flex-col p-5">
          <div>
            <span>Online - {onlineUsers?.length}</span>
            {onlineUsers?.map((user) => (
              <div key={user.id}>{user.username}</div>
            ))}
          </div>
          <div>
            <span>Offline - {offlineUsers?.length}</span>
            {offlineUsers?.map((user) => (
              <div key={user.id}>{user.username}</div>
            ))}
          </div>
        </div>
      </div>
    );
}

export default HubPage;
