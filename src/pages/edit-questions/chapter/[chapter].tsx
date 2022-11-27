import { Chapter, Question } from "@prisma/client";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import DeleteButton from "../../../components/Buttons/DeleteButton";
import Header from "../../../components/Header";
import { supabase } from "../../../utils/supabase";
import { trpc } from "../../../utils/trpc";

const ManageQuestions: NextPage = () => {
  const router = useRouter();
  const { query, isReady } = useRouter();
  const chapter = query.chapter as string;

  const {
    data: questions,
    isLoading,
    isError,
  } = trpc.question.getQuestionsByChapter.useQuery(
    { chapter: parseInt(chapter) },
    { enabled: isReady }
  );
  const utils = trpc.useContext();
  const deleteQuestion = trpc.question.deleteQuestion.useMutation({
    onMutate: () => {
      utils.question.getQuestions.cancel();
      const optimisticUpdate = utils.question.getQuestionsByChapter.getData({
        chapter: parseInt(chapter),
      });

      if (optimisticUpdate) {
        utils.question.getQuestionsByChapter.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.question.getQuestionsByChapter.invalidate();
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

  return (
    <>
      <Header>Delete Questions</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">
          Questions Chapter {chapter}
        </h1>

        <Link className="menu-button bg-slate-400 text-gray-900" href="/">
          Menu
        </Link>
        <button className="menu-button" onClick={() => router.back()}>
          Go Back
        </button>

        {questions.length > 0 ? (
          questions.map((question) => (
            <div
              key={question.id}
              className=" relative mt-6 flex h-auto w-1/4 items-center justify-between bg-slate-500 p-4"
            >
              <h2>{question.question}</h2>
              {question.imageUrl ? (
                <p className="font-bold italic text-red-300">has image</p>
              ) : (
                ""
              )}
              <DeleteButton
                handleClick={handleClick}
                itemToDelete={question}
                deleteItem={deleteQuestion}
              />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center">
            <p className="mt-5 text-3xl font-bold text-red-500">No questions</p>
          </div>
        )}
        <Link
          className="menu-button"
          href={`/create-question/chapter/${chapter}`}
        >
          Create Question
        </Link>
      </main>
    </>
  );
};

export default ManageQuestions;
