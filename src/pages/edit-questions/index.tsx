import type { Chapter } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import { FC, SetStateAction, useState } from "react";
import DeleteButton from "../../components/Buttons/DeleteButton";
import Header from "../../components/Header";
import { trpc } from "../../utils/trpc";

const ManageChapters: NextPage = () => {
  const [showChapterDetails, setShowChapterDetails] = useState<boolean>(false);
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

  const createNewChapter = trpc.question.createChapter.useMutation({
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
  const currentLastChapter = chapters.length + 1;

  const handleDeleteClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    chapter: Chapter
  ) => {
    e.preventDefault();
    deleteChapter.mutate({
      id: chapter.id,
    });
  };

  const handleCreateClick = (desc: string) => {
    createNewChapter.mutate({
      chapter: currentLastChapter,
      description: desc,
    });
    setShowChapterDetails(false);
  };
  return (
    <>
      <Header>Delete Chapter</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">Chapters</h1>
        <Link className="menu-button bg-slate-400 text-gray-900" href="/">
          Menu
        </Link>
        {showChapterDetails && (
          <>
            <ChapterModal
              setShowChapterDetails={setShowChapterDetails}
              handleClick={handleCreateClick}
              chapter={currentLastChapter}
            />
            <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <Link
              href={`edit-questions/chapter/${chapter.number}`}
              key={chapter.id}
              className=" relative mt-6 flex h-auto w-1/4 items-center justify-between bg-slate-500 p-4 transition hover:bg-slate-700"
            >
              <h2>
                <span className="font-bold">{chapter.number}</span>{" "}
                {chapter.description}
              </h2>
              <DeleteButton
                handleClick={handleDeleteClick}
                itemToDelete={chapter}
                deleteItem={deleteChapter}
              />
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center">
            <p className="mt-5 text-3xl font-bold text-red-500">No Chapters</p>
          </div>
        )}
        <button
          onClick={() => setShowChapterDetails(true)}
          className="menu-button bg-slate-400 text-gray-900"
        >
          Create Chapter{" "}
          <span className="font-bold"> {currentLastChapter}</span>
        </button>
      </main>
    </>
  );
};

export default ManageChapters;

interface ChapterModalProps {
  handleClick: (desc: string) => void;
  chapter: number;
  setShowChapterDetails: React.Dispatch<SetStateAction<boolean>>;
}
const ChapterModal: FC<ChapterModalProps> = ({
  handleClick,
  chapter,
  setShowChapterDetails,
}) => {
  const [description, setDescription] = useState<string>("");
  return (
    <div className="absolute z-50 flex w-[300px] flex-col items-center">
      <button
        onClick={() => setShowChapterDetails(false)}
        className="absolute right-0 rounded-md bg-red-400 py-1 px-2 transition hover:bg-red-500"
      >
        X
      </button>
      <p className="text-2xl font-bold">Chapter {chapter} details</p>
      <label className="text-lg text-sky-300" htmlFor="desc">
        Description
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2 w-full bg-slate-700 p-2"
        id="desc"
        required
      />
      <button
        onClick={() => handleClick(description)}
        className="menu-button mt-4"
      >
        Create New Chapter
      </button>
    </div>
  );
};
