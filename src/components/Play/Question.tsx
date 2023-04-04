import type { Answer } from "@prisma/client";
import Image from "next/legacy/image";
import type { FC } from "react";
import type { AnswerObjectType, ChapterType } from "../../utils/types";
import AnswerButton from "../Buttons/AnswerButton";

type QuestionProps = {
  questions: {
    answers: Answer[];
    id: string;
    createdAt: Date;
    question: string;
    imageUrl: string | null;
    imageName: string | null;
    chapterId: string;
    chapter: {
      number: number;
      description: string;
    };
  }[];
  curQuestionIdx: number;
  handleAnswerClicked: (answer: AnswerObjectType, questionId: string) => void;
  trackResult: (
    answerClicked: string,
    isCorrect: boolean,
    questionChapter: ChapterType
  ) => void;
  revealAnswer: boolean;
  handleNextClick: () => void;
};

const Question: FC<QuestionProps> = ({
  questions,
  curQuestionIdx,
  handleAnswerClicked,
  trackResult,
  revealAnswer,
  handleNextClick,
}) => {
  return (
    <div className="w-full sm:w-2/3">
      <div className="flex flex-col items-center justify-center">
        <h3 className="mt-10">Frage</h3>
        <span className="font-bold text-blue-400">
          {curQuestionIdx + 1} / {questions.length}
        </span>
        <p className="text-2xl">{questions[curQuestionIdx]?.question}?</p>
        {questions[curQuestionIdx] && questions[curQuestionIdx]?.imageUrl && (
          <div className="relative h-[500px] w-[500px]">
            <Image
              layout="fill"
              objectFit="contain"
              src={questions[curQuestionIdx]?.imageUrl || ``}
              alt={questions[curQuestionIdx]?.question || ""}
            />
          </div>
        )}
        <div className="mt-10 flex w-full flex-col items-center justify-between gap-4">
          {(questions[curQuestionIdx]?.answers ?? []).map((answer: Answer) => (
            <AnswerButton
              // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
              questionId={questions[curQuestionIdx]!.id}
              questionChapter={questions[curQuestionIdx]!.chapter}
              key={answer.id}
              handleAnswerClicked={handleAnswerClicked}
              trackResult={trackResult}
              answer={answer}
              revealAnswer={revealAnswer}
            />
          ))}
        </div>
        {revealAnswer && (
          <button onClick={handleNextClick} className="menu-button">
            {curQuestionIdx + 1 === questions.length ? "Beenden" : "Weiter"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Question;
