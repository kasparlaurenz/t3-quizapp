import { Answer, Chapter } from "@prisma/client";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AnswerButton from "../../components/Buttons/AnswerButton";
import Header from "../../components/Header";
import TopSection from "../../components/TopSection";
import { trpc } from "../../utils/trpc";
import { AnswerObjectType } from "../../utils/types";

const Play: NextPage = () => {
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [fetchQuestions, setFetchQuestions] = useState(false);
  const [playQuiz, setPlayQuiz] = useState(false);
  const [curQuestionIdx, setCurQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [resultList, setResultList] = useState<
    { answer: string; isCorrect: boolean }[]
  >([]);

  const { data: questions } =
    trpc.question.getQuestionsWithAnswersByChapterSelection.useQuery(
      { chapter: selectedChapters },
      { enabled: fetchQuestions === true }
    );
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.question.getChapters.useQuery();
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

  const hanldeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    chapter: Chapter
  ) => {
    if (e.target.checked) {
      setSelectedChapters([...selectedChapters, chapter.number]);
    } else {
      setSelectedChapters(selectedChapters.filter((c) => c !== chapter.number));
    }
  };

  const handleAnswerClicked = (answer: AnswerObjectType) => {
    if (answer.is_correct) {
      setScore((prev) => prev + 1);
      setCurQuestionIdx((prev) => prev + 1);
    } else {
      setRevealAnswer(true);
    }
  };

  const handleNextClick = () => {
    setRevealAnswer(false);
    setCurQuestionIdx((prev) => prev + 1);
  };

  const trackResult = (answerClicked: string, isCorrect: boolean) => {
    const tempResult = {
      answer: answerClicked,
      isCorrect: isCorrect,
    };
    setResultList((prev: any) => [...prev, tempResult]);
  };

  const resetGame = () => {
    setScore(0);
    setCurQuestionIdx(0);
    setResultList([]);
    setPlayQuiz(true);
  };

  return (
    <>
      <Header>Play</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection title="Play" />
        {playQuiz && questions ? (
          <>
            {questions.length > 0 && curQuestionIdx < questions.length ? (
              <div className="w-full sm:w-2/3">
                <div className="flex flex-col items-center justify-center">
                  <h3 className="mt-10">Question</h3>
                  <span className="font-bold text-blue-400">
                    {curQuestionIdx + 1} / {questions.length}
                  </span>
                  <p className="text-2xl">
                    {questions[curQuestionIdx]?.question}?
                  </p>
                  {questions[curQuestionIdx] &&
                    questions[curQuestionIdx]?.imageUrl && (
                      // <img
                      //   className="w-[300px]"
                      //   alt={questions[curQuestionIdx]?.question || ""}
                      //   src={questions[curQuestionIdx]?.imageUrl || ``}
                      // />
                      <div className="relative h-[500px] w-[500px]">
                        <Image
                          layout="fill"
                          objectFit="contain"
                          src={questions[curQuestionIdx]?.imageUrl || ``}
                          alt={questions[curQuestionIdx]?.question || ""}
                        />
                      </div>
                    )}
                  <div className="mt-10 flex w-full flex-col items-center justify-between gap-4">
                    {(questions[curQuestionIdx]?.answers ?? []).map(
                      (answer: Answer) => (
                        <AnswerButton
                          key={answer.id}
                          handleAnswerClicked={handleAnswerClicked}
                          trackResult={trackResult}
                          answer={answer}
                          revealAnswer={revealAnswer}
                        />
                      )
                    )}
                  </div>
                  {revealAnswer && (
                    <button onClick={handleNextClick} className="menu-button">
                      {curQuestionIdx + 1 === questions.length
                        ? "Finish"
                        : "Next"}
                    </button>
                  )}
                </div>
              </div>
            ) : questions.length === curQuestionIdx && questions.length > 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center">
                <p className="text-lg">
                  You got{" "}
                  <span className="px-2 text-5xl font-bold text-blue-300">
                    {score}
                  </span>{" "}
                  of{" "}
                  <span className="px-2 text-5xl font-bold text-blue-300">
                    {" "}
                    {questions.length}
                  </span>{" "}
                  Questions correct!{" "}
                </p>

                <div className="mt-4 flex flex-col gap-4">
                  {questions.map((question, idx) => (
                    <div
                      key={question.id}
                      className={
                        resultList[idx]?.isCorrect === true
                          ? "result flex flex-col items-center justify-center rounded-md border-2 border-green-500 bg-zinc-800 p-4 text-gray-200 md:w-[500px]"
                          : "result flex flex-col items-center justify-center rounded-md border-2 border-red-500 bg-zinc-800 p-4 text-gray-200 md:w-[500px]"
                      }
                    >
                      {" "}
                      <div className="flex w-full justify-between p-2">
                        <p className="hidden sm:block">
                          {idx + 1} / {questions.length}
                        </p>
                        <div className="flex flex-col items-center">
                          <p className="font-bol text-lg">
                            {question.question}?
                          </p>
                          <p
                            className={
                              resultList[idx]?.isCorrect === true
                                ? "mt-1 text-green-400"
                                : "mt-1 text-red-400"
                            }
                          >
                            Your Selection: {resultList[idx]?.answer}
                          </p>
                        </div>
                        {resultList[idx]?.isCorrect === true ? (
                          <span
                            role="img"
                            aria-label="sheep"
                            className="hidden text-3xl sm:block"
                          >
                            🥳
                          </span>
                        ) : (
                          <span
                            role="img"
                            aria-label="sheep"
                            className="hidden text-3xl sm:block"
                          >
                            😟
                          </span>
                        )}
                      </div>
                      <div className="answers mt-2 flex w-full flex-col items-start">
                        {question.answers.map((answer: Answer, idx: number) => (
                          <p
                            key={answer.answer}
                            className={
                              answer.is_correct
                                ? "rounded-lg border-2 border-green-400 p-2"
                                : "p-2"
                            }
                          >
                            <span className="mr-2">
                              {idx === 0 ? "A" : idx === 1 ? "B" : "C"})
                            </span>
                            {answer.answer}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={resetGame} className="menu-button">
                    Play again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="mt-5 text-3xl font-bold text-red-500">
                  No questions
                </p>
                <Link className="menu-button mt-1" href="create-question">
                  Create Question
                </Link>
              </div>
            )}
          </>
        ) : chapters.length > 0 ? (
          <>
            <label className="mt-4 text-2xl" htmlFor="chapter-selection">
              Choose your Chapters:
            </label>
            <form id="chapter-selection">
              <div className="mt-2 grid grid-cols-3 gap-2">
                {chapters.map((chapter) => (
                  <div key={chapter.id}>
                    <label className="text-2xl">
                      <input
                        className=" mr-1 h-[18px] w-[18px] accent-sky-500"
                        type="checkbox"
                        value={chapter.number}
                        onChange={(e) => hanldeChange(e, chapter)}
                      />
                      {chapter.number}
                    </label>
                  </div>
                ))}
              </div>
            </form>
            <div>
              {selectedChapters.length > 0 ? (
                <>
                  <p className="text-center text-xl">
                    Play with chapter <br />
                    {selectedChapters.map((chapter) => (
                      <span key={chapter} className="font-bold text-sky-500">
                        {chapter}{" "}
                      </span>
                    ))}
                  </p>
                  <button
                    onClick={() => {
                      setFetchQuestions(true);
                      setPlayQuiz(true);
                    }}
                    className="menu-button mt-3"
                  >
                    Play Game
                  </button>
                </>
              ) : (
                <p className="text-center text-xl text-sky-500">
                  No chapter selected.
                  <br />{" "}
                  <span className="italic text-white">
                    Please select at least one chapter
                  </span>
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-lg font-bold text-red-500">No Chapters</p>

            <Link className="menu-button mt-2" href="edit-questions">
              Create a Chapter
            </Link>
          </>
        )}
      </main>
    </>
  );
};

export default Play;
