import { Chapter } from "@prisma/client";
import { NextPage } from "next";
import Link from "next/link";
import DeleteButton from "../components/Buttons/DeleteButton";
import Header from "../components/Header";
import { trpc } from "../utils/trpc";

const DeleteQuestions: NextPage = () => {
  const utils = trpc.useContext();
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.question.getChapters.useQuery();

  const deleteChapter = trpc.question.deleteChapter.useMutation({
    onMutate: () => {
      utils.question.getChapters.cancel();
      const optimisticUpdate = utils.question.getChapters.getData();

      if (optimisticUpdate) {
        utils.question.getChapters.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.question.getChapters.invalidate();
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
    chapter: Chapter
  ) => {
    e.preventDefault();
    deleteChapter.mutate({
      id: chapter.id,
    });
  };
  return (
    <>
      <Header>Delete Chapter</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">Chapters</h1>
        <Link className="menu-button bg-slate-400 text-gray-900" href="/">
          Menu
        </Link>
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <Link
              href={`delete-questions/chapter/${chapter.number}`}
              key={chapter.id}
              className=" mt-6 flex h-auto w-1/4 items-center justify-between bg-slate-500 p-4"
            >
              <h2>Chapter {chapter.number}</h2>
              <DeleteButton
                handleClick={handleClick}
                itemToDelete={chapter}
                deleteItem={deleteChapter}
              />
            </Link>
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

export default DeleteQuestions;
