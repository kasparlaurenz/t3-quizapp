import type {
  Answer,
  Question,
  RecentUserAnswerToQuestion,
} from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import React, { useState } from "react";
import ConfirmModal from "../../../../components/ConfirmationModal";
import Header from "../../../../components/Header";
import TopSection from "../../../../components/TopSection";
import { getServerAuthSession } from "../../../../server/common/get-server-auth-session";
import { RouterOutputs, trpc } from "../../../../utils/trpc";
import Paginate from "../../../../components/Paginate";
import Link from "next/link";

type ResponseObject = RouterOutputs["recent"]["getUserScoreForEachChapter"][0];

const ProfilePage: NextPage = () => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [response, setResponse] = useState<ResponseObject[] | undefined>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = React.useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(3);
  const indexOfLastData = currentPage * limit;
  const indexOfFirstData = indexOfLastData - limit;
  const currentData = response?.slice(indexOfFirstData, indexOfLastData);

  const paginate = (num: number) => {
    setCurrentPage(num);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(response!.length / limit)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const { data: user, refetch: getUser } = trpc.user.getUserById.useQuery();

  const updateUser = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      getUser();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setUserData({
      username: "",
      oldPassword: "",
      newPassword: "",
    });
    setErrorMsg(undefined);
  };

  return (
    <>
      <Header />
      <TopSection title={user?.username} />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 pt-20">
        {showConfirm && (
          <>
            <ConfirmModal
              status="geupdated"
              type="User"
              handleModal={handleModal}
            />
            <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-5 md:flex-row">
            <Link
              className="menu-button"
              href={`/profile/user/${user?.id}/scores`}
            >
              Scores
            </Link>
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-500 p-2 text-white">
              {errorMsg}
            </div>
          )}

          <form
            className="mt-6 flex w-full flex-col items-center justify-center md:max-w-[300px]"
            action="submit"
            onSubmit={handleSubmit}
          >
            <div className="flex w-full flex-col">
              <label htmlFor="username">Benutzername</label>
              <input
                type="text"
                value={userData.username}
                onChange={handleInputChange}
                placeholder={user?.username}
                name="username"
                id="username"
                className="rounded-md bg-slate-700 p-2"
              />
            </div>
            <div className="flex w-full flex-col">
              <label htmlFor="oldPassword">Altes Passwort</label>
              <input
                type="password"
                value={userData.oldPassword}
                onChange={handleInputChange}
                name="oldPassword"
                id="oldPassword"
                className="rounded-md bg-slate-700 p-2"
                required
              />
            </div>
            <div className="flex w-full flex-col">
              <label htmlFor="newPassword">Neues Passwort</label>
              <input
                type="password"
                value={userData.newPassword}
                onChange={handleInputChange}
                name="newPassword"
                id="newPassword"
                className="rounded-md bg-slate-700 p-2"
              />
            </div>
            <button type="submit" className="menu-button">
              {userData.newPassword === ""
                ? "Benutzername ändern"
                : "Benutzername und Passwort ändern"}
            </button>
          </form>
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
