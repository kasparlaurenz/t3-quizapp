import type { Answer, Question } from "@prisma/client";
import type { Dispatch, FC, SetStateAction } from "react";

export type QuestionWithAnswer = Question & {
  answers: Answer[];
};

interface ResultProps {
  score: number;
  questions: QuestionWithAnswer[];
  resultList: {
    answer: string;
    isCorrect: boolean;
    chapterDescription: string;
    chapterNumber: number;
  }[];
  resetGame: () => void;
  setPlayOnlyWrongAnswered: Dispatch<SetStateAction<boolean>>;
}

const Result: FC<ResultProps> = ({
  score,
  questions,
  resultList,
  resetGame,
  setPlayOnlyWrongAnswered,
}) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center">
      <p className="text-lg">
        Du hast{" "}
        <span className="px-2 text-5xl font-bold text-blue-300">{score}</span>{" "}
        aus{" "}
        <span className="px-2 text-5xl font-bold text-blue-300">
          {" "}
          {questions.length}
        </span>{" "}
        Fragen korrekt beantwortet!{" "}
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {questions.map((question, idx) => (
          <div
            key={question.id}
            className={
              resultList[idx]?.isCorrect === true
                ? "result flex flex-col items-center justify-center rounded-md border-2 border-green-500 bg-zinc-800 p-4 text-gray-200 md:w-[600px]"
                : "result flex flex-col items-center justify-center rounded-md border-2 border-red-500 bg-zinc-800 p-4 text-gray-200 md:w-[600px]"
            }
          >
            {" "}
            <div className="flex w-full justify-between p-2">
              <p className="hidden sm:block">
                {idx + 1} / {questions.length}
              </p>
              <div className="flex max-w-xs flex-col items-center">
                <p className="font-bol text-center text-lg">
                  {question.question}?
                </p>
                <p className="mt-1 text-gray-400">
                  Aus Kapitel {resultList[idx]?.chapterNumber}:{" "}
                  {resultList[idx]?.chapterDescription}
                </p>
                <p
                  className={
                    resultList[idx]?.isCorrect === true
                      ? "mt-1 text-center text-green-400"
                      : "mt-1 text-center text-red-400"
                  }
                >
                  Deine Antwort: {resultList[idx]?.answer}
                </p>
              </div>
              {resultList[idx]?.isCorrect === true ? (
                <span
                  role="img"
                  aria-label="sheep"
                  className="hidden text-3xl sm:block"
                >
                  🥳
                </span>
              ) : (
                <span
                  role="img"
                  aria-label="sheep"
                  className="hidden text-3xl sm:block"
                >
                  😟
                </span>
              )}
            </div>
            <div className="answers mt-2 flex w-full flex-col items-start">
              {question.answers.map((answer: Answer, idx: number) => (
                <p
                  key={idx}
                  className={
                    answer.is_correct
                      ? "rounded-lg border-2 border-green-400 p-2"
                      : "p-2"
                  }
                >
                  <span className="mr-2">
                    {idx === 0 ? "A" : idx === 1 ? "B" : "C"})
                  </span>
                  {answer.answer}
                </p>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-4 self-center">
          <button onClick={resetGame} className="menu-button mt-0 bg-blue-500">
            Neustarten
          </button>
          <label className="text-l text-sky-400">
            <input
              type="checkbox"
              className="mr-1 h-[18px] w-[18px] accent-sky-500"
              onChange={(e) => setPlayOnlyWrongAnswered(e.target.checked)}
            />
            Nur falsche Fragen wiederholen
          </label>
        </div>
      </div>
    </div>
  );
};

export default Result;
