import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { RouterOutputs, trpc } from "../../../../../utils/trpc";
import Header from "../../../../../components/Header";
import TopSection from "../../../../../components/TopSection";

type ResponseObject = RouterOutputs["recent"]["getChapterScore"];

const ChapterScorePage: NextPage = () => {
  const { query, isReady } = useRouter();
  const chapterId = query.chapterId as string;

  const {
    data: chapterScore,
    isLoading,
    isError,
  } = trpc.recent.getChapterScore.useQuery(
    { chapterId: chapterId },
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

  console.log(chapterScore);

  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection
          title={`${chapterScore.chapter?.number}. ${chapterScore.chapter?.description}`}
        />
        <div className="mt-2 flex flex-col items-center">
          <div className="flex max-h-96 flex-col">
            {chapterScore.question.map((question, idx) => (
              <QuestionCard key={question.question.id} data={question} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default ChapterScorePage;

type QuestionCardProps = Omit<ResponseObject, "chapter">["question"][0];

const QuestionCard = ({ data }: { data: QuestionCardProps }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const revealAnswerHandler = () => {
    setShowAnswer((prev) => !prev);
  };

  const recentCorrect = data.recentAnswer?.answerState;

  const cardStyle =
    " flex items-center justify-center border-2 bg-slate-700 rounded-md p-2 m-2 h-52 w-96 cursor-pointer hover:bg-slate-600";

  return (
    <div
      className={
        recentCorrect
          ? "border-green-500" + cardStyle
          : "border-red-500" + cardStyle
      }
      onClick={revealAnswerHandler}
    >
      <p className="text-center">
        {showAnswer
          ? data.answer.find((answer) => answer.is_correct)?.answer
          : data.question.question + "?"}
      </p>
    </div>
  );
};