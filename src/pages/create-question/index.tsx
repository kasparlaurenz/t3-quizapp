import { NextPage } from "next";
import Link from "next/link";
import { FC, SetStateAction, useState } from "react";
import Header from "../../components/Header";
import { trpc } from "../../utils/trpc";

const NewQuestion: NextPage = () => {
  const [showChapterDetails, setShowChapterDetails] = useState<boolean>(false);
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.question.getChapters.useQuery();
  const utils = trpc.useContext();
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

  const handleClick = (desc: string) => {
    createNewChapter.mutate({
      chapter: currentLastChapter,
      description: desc,
    });
    setShowChapterDetails(false);
  };

  return (
    <>
      <Header>Create Question</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">Chapters</h1>
        <Link className="menu-button bg-slate-400 text-gray-900" href="/">
          Menu
        </Link>
        {showChapterDetails && (
          <>
            <ChapterModal
              setShowChapterDetails={setShowChapterDetails}
              handleClick={handleClick}
              chapter={currentLastChapter}
            />
            <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        <div className="flex flex-col">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              className="menu-button"
              href={`./create-question/chapter/${chapter.number}`}
            >
              {chapter.number}
            </Link>
          ))}
        </div>
        <button
          onClick={() => setShowChapterDetails(true)}
          className="menu-button"
        >
          Create Chapter{" "}
          <span className="font-bold"> {currentLastChapter}</span>
        </button>
      </main>
    </>
  );
};

export default NewQuestion;

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
        className="absolute right-5 rounded-md bg-red-400 py-1 px-2"
      >
        X
      </button>
      <p className="text-lg font-bold">Chapter {chapter} details</p>
      <label htmlFor="desc">Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-4 w-full bg-slate-700 p-2"
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
