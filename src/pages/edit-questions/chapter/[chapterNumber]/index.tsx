import type { Question } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import DeleteButton from "../../../../components/Buttons/DeleteButton";
import Header from "../../../../components/Header";
import TopSection from "../../../../components/TopSection";
import { supabase } from "../../../../utils/supabase";
import { trpc } from "../../../../utils/trpc";
import { useState } from "react";
import Paginate from "../../../../components/Paginate";
import HiddenIcon from "../../../../components/Icons/HiddenIcon";
import VisibleIcon from "../../../../components/Icons/VisibleIcon";

const ManageQuestions: NextPage = () => {
  const { query, isReady } = useRouter();
  const chapterNumber = query.chapterNumber as string;

  const {
    data: questions,
    isLoading,
    isError,
    refetch: refetchQuestions,
  } = trpc.question.getAllQuestionsByChapter.useQuery(
    { chapter: parseInt(chapterNumber) },
    { enabled: isReady }
  );
  const deleteQuestion = trpc.question.deleteQuestion.useMutation({
    onSuccess: () => {
      refetchQuestions();
    },
  });

  const { data: chapterDescription } = trpc.chapter.getChapterDesc.useQuery(
    { chapter: parseInt(chapterNumber) },
    { enabled: isReady }
  );

  const hideQuestion = trpc.question.updateQuestionVisibility.useMutation({
    onSuccess: () => {
      refetchQuestions();
    },
  });

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

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    question: Question
  ) => {
    e.preventDefault();
    deleteQuestion.mutate({
      id: question.id,
    });
    await supabase.storage
      .from("question-images")
      .remove([`${question.imageName}`]);
  };

  const handleVisibilityClick = (question: Question) => {
    hideQuestion.mutate({
      id: question.id,
      isHidden: !question.isHidden,
    });
  };

  return (
    <>
      <Header>Fragen</Header>
      <TopSection title={chapterDescription?.description ?? ""} />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 pt-20">
        <div className="relative mt-4 flex w-full flex-col items-center justify-start gap-5 p-2">
          {questions.length > 0 ? (
            questions?.map((question) => (
              <div key={question.id} className="flex w-full justify-center">
                <button
                  onClick={() => {
                    handleVisibilityClick(question);
                  }}
                  className="p-4"
                >
                  {question.isHidden ? <HiddenIcon /> : <VisibleIcon />}
                </button>
                <Link
                  href={`/edit-questions/chapter/${chapterNumber}/question/${question.id}`}
                  key={question.id}
                  className={`${
                    question.isHidden
                      ? "bg-zinc-700 text-zinc-500"
                      : "bg-slate-500"
                  } relative flex h-auto w-full items-center justify-start rounded-md p-4 transition hover:bg-slate-700 md:max-w-[400px]`}
                >
                  <h2 className="pr-6">{question.question}</h2>
                  <DeleteButton
                    handleClick={handleClick}
                    itemToDelete={question}
                    deleteItem={deleteQuestion}
                  />
                </Link>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center">
              <p className="mt-5 text-3xl font-bold text-red-500">
                Keine Fragen
              </p>
            </div>
          )}
        </div>
        <Link
          className="menu-button mt-2"
          href={`/create-question/chapter/${chapterNumber}`}
        >
          Neue Frage
        </Link>
      </main>
    </>
  );
};

export default ManageQuestions;
