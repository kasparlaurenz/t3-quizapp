import type { FC } from "react";
import type { AnswerObjectType, ChapterType } from "../../utils/types";

interface AnswerButtonProps {
  questionId: string;
  questionChapter: ChapterType;
  answer: {
    id: string;
    answer: string;
    is_correct: boolean;
  };
  handleAnswerClicked: (answer: AnswerObjectType, questionId: string) => void;
  trackResult: (
    answerClicked: string,
    isCorrect: boolean,
    questionChapter: ChapterType
  ) => void;
  revealAnswer: boolean;
}

const AnswerButton: FC<AnswerButtonProps> = ({
  questionId,
  answer,
  handleAnswerClicked,
  trackResult,
  revealAnswer,
  questionChapter,
}) => {
  return (
    <button
      onClick={() => {
        handleAnswerClicked(answer, questionId);
        trackResult(answer.answer, answer.is_correct, questionChapter);
      }}
      key={answer.id}
      className={
        revealAnswer
          ? answer.is_correct
            ? "reg-button h-auto max-w-xs border-2 border-green-400"
            : "reg-button h-auto max-w-xs"
          : "reg-button h-auto max-w-xs"
      }
    >
      {answer.answer}
    </button>
  );
};

export default AnswerButton;
