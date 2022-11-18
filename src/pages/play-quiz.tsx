import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import AnswerButton from "../components/AnswerButton";
import type { AnswerObjectType } from "../utils/types";
import { trpc } from "../utils/trpc";
import Image from "next/image";

const PlayQuiz: NextPage = () => {
  const [curQuestionIdx, setCurQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const {
    data: questions,
    isLoading,
    isError,
  } = trpc.question.getQuestionsWithAnswers.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  const handleAnswerClicked = (answer: AnswerObjectType) => {
    if (answer.is_correct) {
      setScore((prev) => prev + 1);
      setCurQuestionIdx((prev) => prev + 1);
    } else {
      setCurQuestionIdx((prev) => prev + 1);
    }
  };

  return (
    <>
      <Head>
        <title>QuizApp</title>
        <meta name="description" content="Generated by create-t3-app" />
      </Head>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">QuizApp</h1>

        <Link className="reg-button mt-10 w-fit" href="create-question">
          Create Question
        </Link>
        <Link className="reg-button mt-8 w-fit" href="/">
          Return home
        </Link>

        {questions.length === curQuestionIdx + 1 ?? (
          <div>
            <p>test</p>
          </div>
        )}

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
                  <img
                    className="w-[300px]"
                    alt={questions[curQuestionIdx]?.question || ""}
                    src={questions[curQuestionIdx]?.imageUrl || ``}
                  />
                )}
              <div className="mt-10 flex w-full items-center justify-between gap-4">
                {questions[curQuestionIdx]?.answers
                  .sort(() => Math.random() - 0.5)
                  .map((answer) => (
                    <AnswerButton
                      handleAnswerClicked={handleAnswerClicked}
                      key={answer.id}
                      answer={answer}
                    />
                  ))}
              </div>
            </div>
          </div>
        ) : questions.length === curQuestionIdx ? (
          <div className="mt-8">
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
              Questions correct{" "}
            </p>
          </div>
        ) : (
          <div>
            <p>no more</p>
          </div>
        )}
      </main>
    </>
  );
};

export default PlayQuiz;
