import type { NextPage } from "next";
import { useState } from "react";
import { client, trpc } from "../src/services";
import UserList from "../src/components/TodoList";

const Home: NextPage = () => {
  const [item_text, setItemText] = useState<string>("");
  const createTodo = trpc.user.allUsers.useQuery();
  return (
    <div className="h-screen w-full flex items-center justify-center bg-teal-500 font-sans">
      <div className="bg-white rounded shadow p-6 m-4 w-full lg:w-1/2">
        <UserList />
      </div>
    </div>
  );
};

export default Home;
