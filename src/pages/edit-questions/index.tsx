import type { Chapter } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import { FC, SetStateAction, useState } from "react";
import DeleteButton from "../../components/Buttons/DeleteButton";
import Header from "../../components/Header";
import TopSection from "../../components/TopSection";
import { trpc } from "../../utils/trpc";

const ManageChapters: NextPage = () => {
  const [showChapterDetails, setShowChapterDetails] = useState<boolean>(false);
  const utils = trpc.useContext();
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.chapter.getChapters.useQuery();

  const deleteChapter = trpc.chapter.deleteChapter.useMutation({
    onMutate: () => {
      utils.chapter.getChapters.cancel();
      const optimisticUpdate = utils.chapter.getChapters.getData();

      if (optimisticUpdate) {
        utils.chapter.getChapters.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.chapter.getChapters.invalidate();
    },
  });

  const createNewChapter = trpc.chapter.createChapter.useMutation({
    onMutate: () => {
      utils.chapter.getChapters.cancel();
      const optimisticUpdate = utils.chapter.getChapters.getData();

      if (optimisticUpdate) {
        utils.chapter.getChapters.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.chapter.getChapters.invalidate();
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
        <TopSection title="Chapters" />
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
        <div className="no-scroll relative mt-4 flex max-h-64 w-full flex-col items-center justify-start gap-5 overflow-y-scroll p-2">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <Link
                href={`edit-questions/chapter/${chapter.number}`}
                key={chapter.id}
                className=" relative flex h-auto w-1/4 items-center justify-between bg-slate-500 p-4 transition hover:bg-slate-700"
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
              <p className="mt-2 text-lg font-bold text-red-500">No Chapters</p>
            </div>
          )}
        </div>
        {chapters.length > 3 && (
          <p className="mt-4 italic text-sky-500">
            Scroll to view more questions
          </p>
        )}
        <button
          onClick={() => setShowChapterDetails(true)}
          className="menu-button mt-2"
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
