import { Question } from "@prisma/client";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Answer from "../../../components/Buttons/AnswerButton";
import Header from "../../../components/Header";
import { trpc } from "../../../utils/trpc";
import type { AnswerObjectType } from "../../../utils/types";

const PlayChapter: NextPage = () => {
  const router = useRouter();
  const { query, isReady } = useRouter();
  const chapter = query.chapter as string;

  const [curQuestionIdx, setCurQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [resultList, setResultList] = useState<
    { question: string; answer: string; correct: boolean }[]
  >([]);

  const {
    data: questions,
    isLoading,
    isError,
  } = trpc.question.getQuestionsWithAnswersByChapter.useQuery(
    { chapter: parseInt(chapter) },
    { enabled: isReady }
  );

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

  const handleAnswerClicked = (answer: AnswerObjectType) => {
    if (answer.is_correct) {
      setScore((prev) => prev + 1);
      setCurQuestionIdx((prev) => prev + 1);
    } else {
      setCurQuestionIdx((prev) => prev + 1);
    }
  };

  const trackResult = (
    question: string,
    answerClicked: string,
    isCorrect: boolean
  ) => {
    const tempResult = {
      question: question,
      answer: answerClicked,
      correct: isCorrect,
    };
    setResultList((prev: any) => [...prev, tempResult]);
  };

  return (
    <>
      <Header>Play Quiz</Header>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">QuizApp</h1>

        <button className="menu-button" onClick={() => router.back()}>
          Go Back
        </button>

        {questions.length > 0 && curQuestionIdx < questions.length ? (
          <div>
            <div className="flex flex-col items-center justify-center">
              <h3 className="mt-10">Question</h3>
              <span className="font-bold text-blue-400">
                {curQuestionIdx + 1} / {questions.length}
              </span>
              <p className="text-2xl">{questions[curQuestionIdx]?.question}?</p>
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
              <div className="mt-10 flex w-full items-center justify-between gap-4">
                {questions[curQuestionIdx]?.answers
                  .sort(() => Math.random() - 0.5)
                  .map((answer) => (
                    <Answer
                      key={answer.id}
                      handleAnswerClicked={handleAnswerClicked}
                      trackResult={trackResult}
                      question={questions[curQuestionIdx]?.id ?? ""}
                      answer={answer}
                    />
                  ))}
              </div>
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
                    resultList[idx]?.correct === true
                      ? "result flex w-[500px] flex-col items-center justify-center rounded-md border-2 border-green-500 bg-zinc-800 p-4 text-gray-200"
                      : "result flex flex-col items-center justify-center rounded-md border-2 border-red-500 bg-zinc-800 p-4 text-gray-200"
                  }
                >
                  {" "}
                  <h3 className="text-sm">Question {idx + 1}</h3>
                  <p className="mt-1 text-base font-bold text-sky-400">
                    {question.question}?
                  </p>
                  <p className="mt-2">
                    Your Selection: {resultList[idx]?.answer}
                  </p>
                  <div className="answers mt-2 flex w-full items-center justify-between">
                    {question.answers
                      .sort(() => Math.random() - 0.5)
                      .map((answer, idx) => (
                        <p
                          key={answer.answer}
                          className={
                            answer.is_correct
                              ? "rounded-lg border-2 border-green-400 p-2"
                              : ""
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
              <Link
                className="menu-button mt-1 self-center bg-slate-400 text-gray-900"
                href="/"
              >
                Menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mt-5 text-3xl font-bold text-red-500">No questions</p>
            <Link className="menu-button mt-1" href="create-question">
              Create Question
            </Link>
          </div>
        )}
      </main>
    </>
  );
};

export default PlayChapter;
