import React from "react";
import { client, trpc } from "../services";

const UserList = () => {
  const { data, isLoading, isError, error } = trpc.user.allUsers.useQuery();
  const deleteTodo = trpc.user.deleteUser.useMutation();
  const utils = trpc.useUtils();

  const onDelete = (id: string) => {
    deleteTodo.mutate(
      { userId: id },
      {
        onSuccess: () => {
          void utils.user.allUsers.invalidate();
        },
      }
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center">
        <div
          className="animate-spin inline-block w-8 h-8 border-4 rounded-full"
          role="status"
        >
          <span className="hidden">Loading...</span>
        </div>
      </div>
    );

  if (isError || !data)
    return (
      <div
        className="bg-red-100 rounded-lg py-5 px-6 mb-4 text-base text-red-700"
        role="alert"
      >
        Error: {JSON.stringify(error?.message)}
      </div>
    );

  return (
    <div>
      {data.map((user) => (
        <div className="flex mb-4 items-center" key={user.id}>
          <span>
            {user.fullName} - {user.id} - {user.createdAt} - {user.phone}
          </span>
          <button
            className="flex-no-shrink p-2 ml-2 border-2 rounded text-red border-red hover:text-white hover:bg-red-500"
            onClick={() => onDelete(user.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default UserList;
