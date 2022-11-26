import type { FC } from "react";
import type { AnswerObjectType } from "../../utils/types";

interface AnswerButtonProps {
  answer: {
    id: string;
    answer: string;
    is_correct: boolean;
  };
  handleAnswerClicked: (answer: AnswerObjectType) => void;
  question: string;
  trackResult: (answerClicked: string, isCorrect: boolean) => void;
}

const AnswerButton: FC<AnswerButtonProps> = ({
  answer,
  handleAnswerClicked,
  trackResult,
  question,
}) => {
  return (
    <button
      onClick={() => {
        handleAnswerClicked(answer);
        trackResult(answer.answer, answer.is_correct);
      }}
      key={answer.id}
      className="reg-button h-auto max-w-xs"
    >
      {answer.answer}
    </button>
  );
};

export default AnswerButton;
