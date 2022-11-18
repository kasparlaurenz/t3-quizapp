import type { FC } from "react";
import type { AnswerObjectType } from "../utils/types";

interface AnswerProps {
  answer: {
    id: string;
    answer: string;
    is_correct: boolean;
  };
  handleAnswerClicked: (answer: AnswerObjectType) => void;
}

const Answer: FC<AnswerProps> = ({ answer, handleAnswerClicked }) => {
  return (
    <button
      onClick={() => handleAnswerClicked(answer)}
      key={answer.id}
      className="reg-button h-auto w-36"
    >
      {answer.answer}
    </button>
  );
};

export default Answer;
