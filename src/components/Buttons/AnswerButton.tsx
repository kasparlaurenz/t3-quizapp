import type { FC } from "react";
import type { AnswerObjectType } from "../../utils/types";

interface AnswerProps {
  answer: {
    id: string;
    answer: string;
    is_correct: boolean;
  };
  handleAnswerClicked: (answer: AnswerObjectType) => void;
  question: string;
  trackResult: (
    question: string,
    answerClicked: string,
    isCorrect: boolean
  ) => void;
}

const Answer: FC<AnswerProps> = ({
  answer,
  handleAnswerClicked,
  trackResult,
  question,
}) => {
  return (
    <button
      onClick={() => {
        handleAnswerClicked(answer);
        trackResult(question, answer.answer, answer.is_correct);
      }}
      key={answer.id}
      className="reg-button h-auto w-36"
    >
      {answer.answer}
    </button>
  );
};

export default Answer;
