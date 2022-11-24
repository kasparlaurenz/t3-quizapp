import { NextPage } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import { trpc } from "../../utils/trpc";

const NewQuestion: NextPage = () => {
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

  const handleClick = () => {
    createNewChapter.mutate({
      chapter: currentLastChapter,
    });
  };

  return (
    <>
      <Header>Create Question</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-sky-300">Chapters</h1>
        <Link className="menu-button bg-slate-400 text-gray-900" href="/">
          Menu
        </Link>
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
        <button onClick={handleClick} className="menu-button">
          Create Chapter{" "}
          <span className="font-bold"> {currentLastChapter}</span>
        </button>
      </main>
    </>
  );
};

export default NewQuestion;
