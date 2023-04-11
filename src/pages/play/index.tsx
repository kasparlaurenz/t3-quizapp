import type { Chapter } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import React, { useState } from "react";
import Header from "../../components/Header";
import Question from "../../components/Play/Question";
import Result from "../../components/Result/Result";
import TopSection from "../../components/TopSection";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc, RouterOutputs } from "../../utils/trpc";
import type {
  AnswerObjectType,
  ChapterType,
  ResultList,
} from "../../utils/types";

type Questions =
  RouterOutputs["question"]["getQuestionsWithAnswersByChapterSelection"][0];

const Play: NextPage = () => {
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [fetchQuestions, setFetchQuestions] = useState(false);
  const [playQuiz, setPlayQuiz] = useState(false);
  const [playOnlyWrongAnswered, setPlayOnlyWrongAnswered] = useState(false);
  const [isCheckAll, setIsCheckAll] = useState(false);

  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<Questions[]>([]);
  const [wrongAnsweredQuestions, setWrongAnsweredQuestions] = useState<
    Questions[]
  >([]);

  const [curQuestionIdx, setCurQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const [resultList, setResultList] = useState<ResultList[]>([]);

  const { data } =
    trpc.question.getQuestionsWithAnswersByChapterSelection.useQuery(
      { chapter: selectedChapters },
      {
        enabled: fetchQuestions === true,
        refetchOnWindowFocus: false,
        onSuccess: (data: Questions[]) => {
          setQuestions(data);
          setWrongAnsweredQuestions(data);
        },
      }
    );
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.chapter.getChapters.useQuery(undefined, {
    onSuccess: (data) => {
      setFilteredChapters(data);
    },
    refetchOnWindowFocus: false,
  });

  const updateUserAnswer = trpc.user.updateRecentAnswerToQuestion.useMutation();

  if (isLoading) {
    return (
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div>Loading</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div>Error</div>
      </main>
    );
  }

  const handleSelectChapter = (
    e: React.ChangeEvent<HTMLInputElement>,
    chapter: Chapter
  ) => {
    if (e.target.checked) {
      setSelectedChapters([...selectedChapters, chapter.number]);
    } else {
      setSelectedChapters(selectedChapters.filter((c) => c !== chapter.number));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedChapters(chapters.map((c) => c.number));
      setIsCheckAll(true);
    } else {
      setSelectedChapters([]);
      setIsCheckAll(false);
    }
  };

  const handleAnswerClicked = (
    answer: AnswerObjectType,
    questionId: string
  ) => {
    if (answer.is_correct) {
      setScore((prev) => prev + 1);
      setWrongAnsweredQuestions(
        wrongAnsweredQuestions.filter((q) => q.id !== questionId)
      );
      setCurQuestionIdx((prev) => prev + 1);
    } else {
      setRevealAnswer(true);
    }
    updateUserAnswer.mutate({
      questionId: questionId,
      answerState: answer.is_correct,
    });
  };

  const handleNextClick = () => {
    setRevealAnswer(false);
    setCurQuestionIdx((prev) => prev + 1);
  };

  const trackResult = (
    answerClicked: string,
    isCorrect: boolean,
    questionChapter: ChapterType
  ) => {
    const tempResult = {
      answer: answerClicked,
      isCorrect: isCorrect,
      chapterDescription: questionChapter.description,
      chapterNumber: questionChapter.number,
    };
    setResultList((prev) => [...prev, tempResult]);
  };

  const handleSelectedFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "alle") {
      setFilteredChapters(chapters);
    } else if (e.target.value === "original") {
      setFilteredChapters(chapters.filter((c) => c.isOriginal));
    } else if (e.target.value === "eigene") {
      setFilteredChapters(chapters.filter((c) => !c.isOriginal));
    }
  };

  console.log("1wrongs", wrongAnsweredQuestions);
  console.log("1questions", questions);
  console.log("1data", data);
  console.log("1index", curQuestionIdx);
  console.log("1selectedChapters", selectedChapters);

  const resetGame = () => {
    if (playOnlyWrongAnswered) {
      setQuestions(wrongAnsweredQuestions);
      setPlayOnlyWrongAnswered(false);
    } else {
      console.log("2data", data);
      if (data) {
        setQuestions(data);
        setWrongAnsweredQuestions(data);
      }
    }

    setScore(0);
    setCurQuestionIdx(0);
    setResultList([]);
    setPlayQuiz(true);
  };

  return (
    <>
      <Header>Fragebogen</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection title="Kapitel" />
        {playQuiz && questions ? (
          <>
            {questions.length > 0 && curQuestionIdx < questions.length ? (
              <Question
                curQuestionIdx={curQuestionIdx}
                questions={questions}
                handleAnswerClicked={handleAnswerClicked}
                handleNextClick={handleNextClick}
                revealAnswer={revealAnswer}
                trackResult={trackResult}
              />
            ) : questions.length === curQuestionIdx && questions.length > 0 ? (
              <Result
                score={score}
                questions={questions}
                resetGame={resetGame}
                resultList={resultList}
                setPlayOnlyWrongAnswered={setPlayOnlyWrongAnswered}
              />
            ) : (
              <div className="flex flex-col items-center">
                <p className="mt-5 text-3xl font-bold text-red-500">
                  Keine Fragen gefunden
                </p>
              </div>
            )}
          </>
        ) : chapters.length > 0 ? (
          <>
            <select
              className="mt-4 cursor-pointer rounded-lg bg-slate-400 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              name="filter"
              id="filter"
              onChange={handleSelectedFilter}
            >
              <option value="alle">Alle</option>
              <option value="original">Original</option>
              <option value="eigene">Eigene</option>
            </select>
            <form
              id="chapter-selection"
              className="mt-4 flex flex-col items-center justify-center"
            >
              {filteredChapters.length > 1 && (
                <>
                  <label className="text-2xl text-sky-400">
                    <input
                      type="checkbox"
                      className="mr-1 h-[18px] w-[18px] accent-sky-500"
                      onChange={handleSelectAll}
                      checked={isCheckAll}
                    />
                    Alle
                  </label>
                </>
              )}
              <div className="mt-2 flex flex-col gap-2">
                {filteredChapters.map((chapter) => (
                  <div key={chapter.id}>
                    <label className="text-lg">
                      <input
                        className=" mr-1 h-[14px] w-[14px] accent-sky-500"
                        type="checkbox"
                        value={chapter.number}
                        onChange={(e) => handleSelectChapter(e, chapter)}
                        checked={selectedChapters.includes(chapter.number)}
                      />
                      {chapter.number}. {chapter.description}
                    </label>
                  </div>
                ))}
              </div>

              {selectedChapters.length > 0 ? (
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setFetchQuestions(true);
                    setPlayQuiz(true);
                  }}
                  className="menu-button mt-3"
                >
                  Starten
                </button>
              ) : (
                <span className="w-2/3 text-center italic text-sky-400">
                  Bitte wähle mindestens ein Kapitel zum Starten.
                </span>
              )}
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-lg font-bold text-red-500">Keine Kapitel</p>

            <Link className="menu-button mt-2" href="edit-questions">
              Erstelle Kapitel
            </Link>
          </>
        )}
      </main>
    </>
  );
};

export default Play;

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
