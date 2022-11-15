import type { FC } from "react";

interface AnswerProps {
  answer: {
    id: string;
    answer: string;
    is_correct: boolean;
  };
}

const Answer: FC<AnswerProps> = ({ answer }) => {
  return (
    <button key={answer.id} className="reg-button h-auto w-36">
      {answer.answer}
    </button>
  );
};

export default Answer;
