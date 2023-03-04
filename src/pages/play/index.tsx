import type { Answer, Chapter } from "@prisma/client";
import type { NextPage } from "next";
import Image from "next/legacy/image";
import Link from "next/link";
import React, { useState } from "react";
import AnswerButton from "../../components/Buttons/AnswerButton";
import Header from "../../components/Header";
import Result from "../../components/Result/Result";
import TopSection from "../../components/TopSection";
import { trpc } from "../../utils/trpc";
import type {
  AnswerObjectType,
  ChapterType,
  ResultList,
} from "../../utils/types";

const Play: NextPage = () => {
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [fetchQuestions, setFetchQuestions] = useState(false);
  const [playQuiz, setPlayQuiz] = useState(false);
  const [isCheckAll, setIsCheckAll] = useState(false);

  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [curQuestionIdx, setCurQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  const [resultList, setResultList] = useState<ResultList[]>([]);

  const { data: questions } =
    trpc.question.getQuestionsWithAnswersByChapterSelection.useQuery(
      { chapter: selectedChapters },
      { enabled: fetchQuestions === true, refetchOnWindowFocus: false }
    );
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.chapter.getChapters.useQuery();
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
              <div className="w-full sm:w-2/3">
                <div className="flex flex-col items-center justify-center">
                  <h3 className="mt-10">Frage</h3>
                  <span className="font-bold text-blue-400">
                    {curQuestionIdx + 1} / {questions.length}
                  </span>
                  <p className="text-2xl">
                    {questions[curQuestionIdx]?.question}?
                  </p>
                  {questions[curQuestionIdx] &&
                    questions[curQuestionIdx]?.imageUrl && (
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
                          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
                          questionChapter={questions[curQuestionIdx]!.chapter}
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
                        ? "Beenden"
                        : "Weiter"}
                    </button>
                  )}
                </div>
              </div>
            ) : questions.length === curQuestionIdx && questions.length > 0 ? (
              <Result
                score={score}
                questions={questions}
                resetGame={resetGame}
                resultList={resultList}
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
            <label className="mt-4 text-2xl" htmlFor="chapter-selection">
              Kapitel wählen
            </label>
            <form
              id="chapter-selection"
              className="flex flex-col items-center justify-center"
            >
              {chapters.length > 1 && (
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
                {chapters.map((chapter) => (
                  <div key={chapter.id}>
                    <label className="text-lg">
                      <input
                        className=" mr-1 h-[14px] w-[14px] accent-sky-500"
                        type="checkbox"
                        value={chapter.number}
                        onChange={(e) => handleSelectChapter(e, chapter)}
                        checked={selectedChapters.includes(chapter.number)}
                      />
                      {chapter.number} {chapter.description}
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
