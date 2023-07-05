import type { Chapter } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import Header from "../../components/Header";
import Question from "../../components/Play/Question";
import Result from "../../components/Result/Result";
import TopSection from "../../components/TopSection";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { type RouterOutputs, trpc } from "../../utils/trpc";
import type {
  AnswerObjectType,
  ChapterType,
  ResultList,
} from "../../utils/types";

type Questions =
  RouterOutputs["question"]["getQuestionsWithAnswersByChapterSelection"][0];

type ChapterWithCategories = RouterOutputs["chapter"]["getChapters"][0];

const Play: NextPage = () => {
  const { data: session } = useSession();
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [fetchQuestions, setFetchQuestions] = useState(false);
  const [playQuiz, setPlayQuiz] = useState(false);
  const [playOnlyWrongAnswered, setPlayOnlyWrongAnswered] = useState(false);
  const [isCheckAll, setIsCheckAll] = useState(false);

  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<
    ChapterWithCategories[]
  >([]);
  const [questions, setQuestions] = useState<Questions[]>([]);
  const [wrongAnsweredQuestions, setWrongAnsweredQuestions] = useState<
    Questions[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [showCategories, setShowCategories] = useState(false);

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

  const { data: categories } = trpc.category.getCategories.useQuery();

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

  const handleCategoryClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categoryId = e.target.id;
    if (e.target.checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
      filterByCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
      filterByCategories(selectedCategories.filter((c) => c !== categoryId));
    }
  };

  const filterByCategories = (selectedCategories: string[]) => {
    if (selectedCategories.length === 0) {
      setFilteredChapters(chapters);
      return;
    }
    const filteredChapters = chapters.filter((chapter) => {
      const categories = chapter.categories;
      const categoriesOnChapter = categories.map(
        (category) => category.categoryId
      );
      return selectedCategories.some((category) =>
        categoriesOnChapter.includes(category)
      );
    });
    setFilteredChapters(filteredChapters);
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

  const resetGame = () => {
    if (playOnlyWrongAnswered) {
      setQuestions(wrongAnsweredQuestions);
      setPlayOnlyWrongAnswered(false);
    } else {
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
      <TopSection isPlay={playQuiz} title="Kapitel" />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 pt-20">
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
            {categories && categories.length > 0 && (
              <>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className={`${
                    showCategories ? "bg-slate-500" : ""
                  } menu-button`}
                >
                  Kategorien
                </button>
                <div
                  className={`${
                    showCategories ? "grid" : "hidden"
                  } max-w-96 mt-6 ${
                    categories.length === 1
                      ? "gird-cols-1"
                      : categories.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  } gap-x-6`}
                >
                  {categories?.map((category) => (
                    <div key={category.id} className="flex items-center gap-1">
                      <input
                        className="mr-2 h-[18px] w-[18px] accent-sky-500"
                        type="checkbox"
                        id={category.id}
                        onChange={handleCategoryClick}
                      />
                      <label
                        className="text-lg text-white"
                        htmlFor={category.name}
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
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

            {session?.user?.role === "ADMIN" && (
              <Link className="menu-button mt-2" href="edit-questions">
                Erstelle Kapitel
              </Link>
            )}
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
