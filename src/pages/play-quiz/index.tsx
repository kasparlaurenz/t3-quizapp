import type { NextPage } from "next";
import Link from "next/link";
import Header from "../../components/Header";
import { trpc } from "../../utils/trpc";

const Play: NextPage = () => {
  const {
    data: chapters,
    isLoading,
    isError,
  } = trpc.question.getChapters.useQuery();
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
  return (
    <>
      <Header>Play</Header>
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
              href={`./play-quiz/chapter/${chapter.number}`}
            >
              <span className="text-l block font-bold text-sky-300">
                {chapter.number}
              </span>
              <span> {chapter.description}</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default Play;
