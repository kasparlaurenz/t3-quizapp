import type { GetServerSideProps, NextPage } from "next";

import React from "react";
import ConfirmModal from "../../../components/ConfirmationModal";
import Header from "../../../components/Header";
import TopSection from "../../../components/TopSection";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { trpc } from "../../../utils/trpc";

const ProfilePage: NextPage = () => {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [toggleView, setToggleView] = React.useState(false);

  const [userData, setUserData] = React.useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { data: chapters } = trpc.chapter.getChapters.useQuery();

  console.log("chapters", chapters);

  const { data: recent } = trpc.recent.getRecentAnswersOfChatper.useQuery({
    chapterNumber: 1,
  });

  console.log("recent", recent);

  const { data: user, refetch } = trpc.user.getUserById.useQuery();

  const updateUser = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      refetch();
      resetForm();
      setShowConfirm(true);
    },
    onError: (err) => {
      setErrorMsg(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateUser.mutate({
      previousPassword: userData.oldPassword,
      newPassword: userData.newPassword,
      username: userData.username === "" ? user!.username : userData.username,
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
    setErrorMsg(null);
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
        <div className="flex w-full items-center justify-center">
          <aside>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setToggleView((prev) => !prev)}
                className="menu-button"
              >
                Recent Answers
              </button>
              <button
                onClick={() => setToggleView((prev) => !prev)}
                className="menu-button"
              >
                User
              </button>
            </div>
          </aside>
          {errorMsg && (
            <div className="rounded-md bg-red-500 p-2 text-white">
              {errorMsg}
            </div>
          )}
          {toggleView ? (
            <form
              className="mt-6 w-full md:max-w-[500px]"
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
                  required
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
                {userData.newPassword === "" ? "Update Username" : "Update"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center">
              <div>Scores</div>
              <div>Questions</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });
  console.log("getServerSideProps", session);

  if (!session || !session.user || session.user.role === "GUEST") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};
