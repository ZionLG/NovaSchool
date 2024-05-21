import React, { useCallback, useEffect, useState } from "react";
import { trpc } from "../../services";
import { useRouter } from "next/router";
import { Input } from "../../components/ui/input";
import { Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Chat from "../../components/Chat";
import Missions from "../../components/Missions";

function HubPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data } = trpc.hub.hubByName.useQuery(
    {
      hubName: router.query.slug?.toString() ?? "",
    },
    { enabled: !!router.query.slug }
  );
  const chatId = data?.chat.id;
  const hubId = data?.hub.id;
  const user = useUser();

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

            void utils.chat.getMessages.invalidate({
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
  if (data && chatId && hubId)
    return (
      <div className="container pt-16 flex grow">
        <Missions hubId={hubId} />
        <Chat chatId={chatId} />
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
