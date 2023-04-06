import type { GetServerSideProps, NextPage } from "next";

import React, { useState } from "react";
import ConfirmModal from "../../../components/ConfirmationModal";
import Header from "../../../components/Header";
import TopSection from "../../../components/TopSection";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { trpc } from "../../../utils/trpc";
import { type Question } from "@prisma/client";

const ProfilePage: NextPage = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUser, setShowUser] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>();
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>();

  const { data: questions } = trpc.question.getQuestionsByChapterId.useQuery(
    {
      chapterId: selectedChapter!,
    },
    {
      enabled: !!selectedChapter,
      onSuccess: (data) => {
        setSelectedQuestions(data);
      },
    }
  );

  console.log("Questions", selectedQuestions);

  const [userData, setUserData] = React.useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: chapters } = trpc.chapter.getChapters.useQuery();

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
        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                setShowUser(true);
                setShowAnswers(false);
              }}
              className="menu-button"
            >
              User
            </button>
            <button
              onClick={() => {
                setShowUser(false);
                setShowAnswers(true);
              }}
              className="menu-button"
            >
              Recent Answers
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-500 p-2 text-white">
              {errorMsg}
            </div>
          )}
          {showUser && (
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
          )}
          {showAnswers && (
            <div className="flex flex-col items-center">
              <select
                className="mt-4 cursor-pointer rounded-lg bg-slate-400 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                name="filter"
                id="filter"
                onChange={(e) => setSelectedChapter(e.target.value)}
              >
                <option value="">Select Chapter</option>
                {chapters?.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.number}. {chapter.description}
                  </option>
                ))}
              </select>
              {selectedQuestions?.map((question) => (
                <div key={question.id} className="flex flex-col items-center">
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-bold">{question.question}</p>
                  </div>
                </div>
              ))}
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
