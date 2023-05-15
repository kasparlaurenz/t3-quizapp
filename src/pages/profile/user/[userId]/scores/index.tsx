import React from "react";
import Header from "../../../../../components/Header";
import TopSection from "../../../../../components/TopSection";
import { trpc } from "../../../../../utils/trpc";
import Link from "next/link";

const Scores = () => {
  const {
    data: scores,
    isLoading,
    refetch,
    isError,
  } = trpc.recent.getUserScoreForEachChapter.useQuery();

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

  console.log(scores);
  return (
    <>
      <Header />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection title="Scores" />

        <div className="relative mt-6 w-2/3 overflow-x-auto rounded-lg shadow-md">
          <table className="w-full text-left text-sm text-gray-50">
            <thead className="bg-neutral-200 text-xs uppercase text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Kapitel
                </th>
                <th scope="col" className="px-6 py-3">
                  Score
                </th>
                <th scope="col" className="px-6 py-3">
                  Fortschritt
                </th>
                <th scope="col" className="px-6 py-3">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, idx) => (
                <tr
                  key={score.chapter.id}
                  className={
                    idx % 2 === 0 ? "bg-neutral-800" : "bg-neutral-700"
                  }
                >
                  <th
                    scope="row"
                    className="whitespace-nowrap px-6 py-4 font-medium text-gray-100"
                  >
                    {score.chapter.number}. {score.chapter.description}
                  </th>
                  <td className="px-6 py-4">
                    {score.correctCount} / {score.questionsCount} korrekt
                  </td>
                  <td className="px-6 py-4">
                    <ProgressBar width={score.chapterScoreInPercent} />
                    {score.chapterScoreInPercent}%{" "}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/profile/user/${score.userId}/scores/${score.chapter.id}`}
                      className="text-sky-400 hover:underline"
                    >
                      Anzeigen
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Scores;

const ProgressBar = ({ width }: { width: number }) => {
  const color =
    width >= 80 ? "bg-green-300" : width >= 50 ? "bg-yellow-300" : "bg-red-300";

  return (
    <div className="mb-4 mt-4 flex h-2 w-3/4 rounded-md bg-zinc-600 text-xs">
      <div
        style={{ width: `${width}%` }}
        className={`flex h-full flex-col justify-center whitespace-nowrap rounded-md text-center text-white shadow-none ${color} `}
      ></div>
    </div>
  );
};
