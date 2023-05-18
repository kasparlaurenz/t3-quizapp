import type { Chapter } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import type { FC, SetStateAction } from "react";
import { useState } from "react";
import DeleteButton from "../../components/Buttons/DeleteButton";
import Header from "../../components/Header";
import TopSection from "../../components/TopSection";
import { trpc } from "../../utils/trpc";
import HiddenIcon from "../../components/Icons/HiddenIcon";
import VisibleIcon from "../../components/Icons/VisibleIcon";

const ManageChapters: NextPage = () => {
  const [showChapterDetails, setShowChapterDetails] = useState<boolean>(false);
  const [isOriginal, setIsOriginal] = useState<boolean>(true);
  const [hidden, setHidden] = useState<boolean>(false);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const {
    data: chapters,
    isLoading,
    isError,
    refetch: refetchChapters,
  } = trpc.chapter.getAllChapters.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setFilteredChapters(data);
    },
  });

  const deleteChapter = trpc.chapter.deleteChapter.useMutation({
    onSuccess: () => {
      refetchChapters();
    },
  });

  const createNewChapter = trpc.chapter.createChapter.useMutation({
    onSuccess: () => {
      refetchChapters();
    },
    onError: ({ message }) => {
      console.log("ERROR FE", message);
    },
  });

  const hideChapter = trpc.chapter.updateChapterVisibility.useMutation({
    onSuccess: () => {
      refetchChapters();
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
      isOriginal,
    });
    setShowChapterDetails(false);
  };

  const handleSelectedFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "alle") {
      setFilteredChapters(chapters);
    } else if (e.target.value === "original") {
      setFilteredChapters(chapters.filter((c) => c.isOriginal));
    } else if (e.target.value === "eigene") {
      setFilteredChapters(chapters.filter((c) => !c.isOriginal));
    }
  };

  const handleVisibilityClick = (chapter: Chapter) => {
    hideChapter.mutate({
      id: chapter.id,
      isHidden: !chapter.isHidden,
    });
  };

  return (
    <>
      <Header>Kapitel</Header>
      <TopSection title="Kapitel" />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 pt-20">
        {showChapterDetails && (
          <>
            <ChapterModal
              setShowChapterDetails={setShowChapterDetails}
              handleClick={handleCreateClick}
              chapter={currentLastChapter}
              isOriginal={isOriginal}
              setIsOriginal={setIsOriginal}
            />
            <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        <div className=" relative mt-4 flex  w-full flex-col items-center justify-start gap-5 p-2">
          <select
            className="cursor-pointer rounded-lg bg-slate-400 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            name="filter"
            id="filter"
            onChange={handleSelectedFilter}
          >
            <option value="alle">Alle</option>
            <option value="original">Original</option>
            <option value="eigene">Eigene</option>
          </select>
          {filteredChapters.length > 0 ? (
            filteredChapters.map((chapter) => (
              <div key={chapter.id} className="flex w-full justify-center">
                <button
                  onClick={() => {
                    handleVisibilityClick(chapter);
                  }}
                  className="p-4"
                >
                  {chapter.isHidden ? <HiddenIcon /> : <VisibleIcon />}
                </button>

                <Link
                  href={`edit-questions/chapter/${chapter.number}`}
                  key={chapter.id}
                  className="relative flex h-auto w-full items-center justify-start rounded-md bg-slate-500 p-4 transition hover:bg-slate-700 md:max-w-[400px]"
                >
                  <h2>
                    <span className="font-bold">{chapter.number}.</span>{" "}
                    {chapter.description}
                  </h2>

                  <DeleteButton
                    handleClick={handleDeleteClick}
                    itemToDelete={chapter}
                    deleteItem={deleteChapter}
                  />
                </Link>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center">
              <p className="mt-2 text-lg font-bold text-red-500">
                Keine Kapitel
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowChapterDetails(true)}
          className="menu-button mt-2"
        >
          Neues Kapitel {currentLastChapter}
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
  isOriginal: boolean;
  setIsOriginal: React.Dispatch<SetStateAction<boolean>>;
}
const ChapterModal: FC<ChapterModalProps> = ({
  handleClick,
  chapter,
  setShowChapterDetails,
  isOriginal,
  setIsOriginal,
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
      <p className="text-2xl font-bold">Kapitel {chapter}</p>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2 w-full bg-slate-700 p-2"
        id="desc"
        placeholder="Titel"
        required
      />
      <label className="text-l mt-2 text-sky-400">
        <input
          type="checkbox"
          className="mr-1 h-[18px] w-[18px] accent-sky-500"
          checked={isOriginal}
          onChange={() => setIsOriginal(!isOriginal)}
        />
        Original
      </label>
      <button
        onClick={() => handleClick(description)}
        className="menu-button mt-4"
      >
        Erstelle neues Kapitel
      </button>
    </div>
  );
};
