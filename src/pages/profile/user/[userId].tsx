import type { NextPage } from "next";
import { useRouter } from "next/router";

import React from "react";
import ConfirmModal from "../../../components/ConfirmationModal";
import Header from "../../../components/Header";
import TopSection from "../../../components/TopSection";
import { trpc } from "../../../utils/trpc";

const ProfilePage: NextPage = () => {
  const { query, isReady } = useRouter();
  const utils = trpc.useContext();
  const userId = query.userId as string;

  const [userData, setUserData] = React.useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { data: user } = trpc.user.getUserById.useQuery(
    { id: userId },
    { enabled: isReady }
  );

  const updatePassword = trpc.user.updateUser.useMutation({
    onMutate: () => {
      utils.user.getUserById.cancel();
      const optimisticUpdate = utils.user.getUserById.getData({ id: userId });

      if (optimisticUpdate) {
        utils.user.getUserById.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.user.getUserById.invalidate();
    },
    onSuccess: () => {
      resetForm();
      setShowConfirm(true);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updatePassword.mutate({
      id: userId,
      previousPassword: userData.oldPassword,
      newPassword: userData.newPassword,
      username: userData.username,
    });
  };

  const handleModal = () => {
    setShowConfirm((prev) => !prev);
  };

  const resetForm = () => {
    setUserData({
      username: "",
      oldPassword: "",
      newPassword: "",
    });
  };

  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection title={user?.username} />
        {showConfirm && (
          <>
            <ConfirmModal
              status="updated"
              type="User"
              handleModal={handleModal}
            />
            <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        <div className="flex w-full flex-col items-center">
          <form
            className="mt-6 w-full md:max-w-[650px]"
            action="submit"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                value={userData.username}
                onChange={(e) =>
                  setUserData({ ...userData, username: e.target.value })
                }
                placeholder={user?.username}
                name="username"
                id="username"
                className="bg-slate-700 p-2"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="oldPassword">Old Password</label>
              <input
                type="password"
                value={userData.oldPassword}
                onChange={(e) =>
                  setUserData({ ...userData, oldPassword: e.target.value })
                }
                name="oldPassword"
                id="oldPassword"
                className="bg-slate-700 p-2"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                value={userData.newPassword}
                onChange={(e) =>
                  setUserData({ ...userData, newPassword: e.target.value })
                }
                name="newPassword"
                id="newPassword"
                className="bg-slate-700 p-2"
              />
            </div>
            <button type="submit" className="menu-button">
              Update User
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
