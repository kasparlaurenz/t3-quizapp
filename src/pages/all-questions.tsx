import type { Question } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import Header from "../components/Header";
import { supabase } from "../utils/supabase";
import { trpc } from "../utils/trpc";

const AllQuestions: NextPage = () => {
  const utils = trpc.useContext();
  const {
    data: questions,
    isLoading,
    isError,
  } = trpc.question.getQuestions.useQuery();

  const deleteQuestion = trpc.question.deleteQuestion.useMutation({
    onMutate: () => {
      utils.question.getQuestions.cancel();
      const optimisticUpdate = utils.question.getQuestions.getData();

      if (optimisticUpdate) {
        utils.question.getQuestions.setData(undefined, optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.question.getQuestions.invalidate();
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
    const { data, error } = await supabase.storage
      .from("question-images")
      .remove([`${question.imageName}`]);
  };
  return (
    <>
      <Header>All Questions</Header>

      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">All questions</h1>

        <Link className="menu-button bg-slate-400 text-gray-900" href="/">
          Menu
        </Link>

        {questions.length > 0 ? (
          questions.map((question) => (
            <div
              key={question.id}
              className=" mt-6 flex h-auto w-1/4 items-center justify-between bg-slate-500 p-4"
            >
              <h2>{question.question}</h2>
              <button
                onClick={(e) => handleClick(e, question)}
                className="reg-button flex w-8 items-center justify-center bg-red-400"
              >
                X
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center">
            <p className="mt-5 text-3xl font-bold text-red-500">No questions</p>
            <Link className="menu-button" href="create-question">
              Create Question
            </Link>
          </div>
        )}
      </main>
    </>
  );
};

export default AllQuestions;
