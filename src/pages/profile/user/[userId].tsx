import type {
  Answer,
  Question,
  RecentUserAnswerToQuestion,
} from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import React, { useState } from "react";
import ConfirmModal from "../../../components/ConfirmationModal";
import Header from "../../../components/Header";
import TopSection from "../../../components/TopSection";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { trpc } from "../../../utils/trpc";
import Paginate from "../../../components/Paginate";

interface ResponseObject {
  question: Question;
  answer: Answer[];
  recentAnswer: RecentUserAnswerToQuestion | undefined;
}

const ProfilePage: NextPage = () => {
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [showUser, setShowUser] = useState(true);
  const [showAnswerScreen, setShowAnswerScreen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | undefined>();
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

  const { refetch: getResponse } = trpc.recent.getResponse.useQuery(
    {
      chapterId: selectedChapter!,
    },
    {
      enabled: !!selectedChapter,
      onSuccess: (data) => {
        setResponse(data);
      },
    }
  );

  const { data: chapters } = trpc.chapter.getChapters.useQuery();
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

  const countOfCorrectAnswers = response?.filter(
    (item) => item.recentAnswer?.answerState === true
  ).length;

  const countOfQuestions = response?.length;

  const progressInPercent = Math.round(
    (countOfCorrectAnswers! / countOfQuestions!) * 100
  );

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

  const resetScore = trpc.recent.resetStatesOfChapter.useMutation({
    onSuccess: () => {
      getResponse();
    },
  });

  const handleResetScore = () => {
    resetScore.mutate({ chapterId: selectedChapter! });
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
          <div className="flex flex-col items-center gap-5 md:flex-row">
            <button
              onClick={() => {
                setShowUser(true);
                setShowAnswerScreen(false);
              }}
              className="menu-button mt-4"
            >
              Benutzer
            </button>
            <button
              onClick={() => {
                setShowUser(false);
                setShowAnswerScreen(true);
              }}
              className="menu-button mt-0 md:mt-4"
            >
              Antworten
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-500 p-2 text-white">
              {errorMsg}
            </div>
          )}
          {showUser && (
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
          )}
          {showAnswerScreen && (
            <div className="mt-2 flex flex-col items-center">
              <select
                className="mt-4 w-auto cursor-pointer rounded-lg bg-slate-400 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                name="filter"
                id="filter"
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSelectedChapter(undefined);
                    setResponse(undefined);
                  }
                  setSelectedChapter(e.target.value);
                }}
              >
                <option value="">Kapitel</option>
                {chapters?.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.number}. {chapter.description}
                  </option>
                ))}
              </select>
              {!selectedChapter ? (
                <div className="mt-4 text-center text-gray-400">
                  <p>Wähle ein Kapitel</p>
                </div>
              ) : (
                <div className="mt-4 flex w-80 flex-col items-center">
                  <p className="text-xl font-bold">
                    {countOfCorrectAnswers} aus {countOfQuestions} richtig.
                  </p>
                  <ProgressBar width={progressInPercent} />
                  <p>Klicke um richtige Antwort zu sehen.</p>
                  {countOfCorrectAnswers! > 0 && (
                    <button
                      onClick={handleResetScore}
                      className="menu-button mt-4"
                    >
                      Zurücksetzen
                    </button>
                  )}
                </div>
              )}
              <div className="flex h-96 flex-col">
                {currentData?.map((data) => (
                  <QuestionCard key={data.question.id} data={data} />
                ))}
              </div>
              {response && response.length! > 3 && (
                <Paginate
                  currentPage={currentPage}
                  dataPerPage={limit}
                  totalData={response.length!}
                  paginate={paginate}
                  nextPage={nextPage}
                  prevPage={prevPage}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const QuestionCard = ({ data }: { data: ResponseObject }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const revealAnswerHandler = () => {
    setShowAnswer((prev) => !prev);
  };

  const recentCorrect = data.recentAnswer?.answerState;

  const cardStyle =
    " flex items-center justify-center border-2 bg-slate-700 rounded-md p-2 m-2 h-28 w-80 cursor-pointer hover:bg-slate-600";

  return (
    <div
      className={
        recentCorrect
          ? "border-green-500" + cardStyle
          : "border-red-500" + cardStyle
      }
      onClick={revealAnswerHandler}
    >
      <p>
        {showAnswer
          ? data.answer.find((answer) => answer.is_correct)?.answer
          : data.question.question + "?"}
      </p>
    </div>
  );
};

const ProgressBar = ({ width }: { width: number }) => {
  const color =
    width >= 80 ? "bg-green-300" : width >= 50 ? "bg-yellow-300" : "bg-red-300";

  return (
    <div className="mb-4 mt-4 flex h-2 w-3/4 rounded-md bg-zinc-600 text-xs">
      <div
        style={{ width: `${width}%` }}
        className={`flex h-full flex-col justify-center whitespace-nowrap rounded-md text-center text-white shadow-none ${color} `}
      ></div>
    </div>
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
