import type { ChangeEvent, FC } from "react";
import type { InitialQuestionType } from "../utils/types";
import type { SetStateAction } from "react";

interface NewQuestionInputProps {
  value: string;
  setNewQuestion: React.Dispatch<SetStateAction<InitialQuestionType>>;
  htmlFor: string;
  children: React.ReactNode;
  isRequired: boolean;
  placeholder: string;
}

const NewQuestionInput: FC<NewQuestionInputProps> = ({
  setNewQuestion,
  value,
  htmlFor,
  children,
  isRequired,
  placeholder,
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    switch (htmlFor) {
      case "question":
        setNewQuestion((newQuestion) => ({
          ...newQuestion,
          question: e.target.value,
        }));
        break;
      case "wrong_answer1":
        setNewQuestion((newQuestion) => ({
          ...newQuestion,
          wrong_answer1: {
            ...newQuestion.wrong_answer1,
            answer: e.target.value,
          },
        }));
        break;
      case "wrong_answer2":
        setNewQuestion((newQuestion) => ({
          ...newQuestion,
          wrong_answer2: {
            ...newQuestion.wrong_answer2,
            answer: e.target.value,
          },
        }));
        break;
      case "correct_answer":
        setNewQuestion((newQuestion) => ({
          ...newQuestion,
          correct_answer: {
            ...newQuestion.correct_answer,
            answer: e.target.value,
          },
        }));
        break;

      default:
        break;
    }
  };
  return (
    <div className="flex flex-col">
      <label htmlFor={htmlFor}>{children}</label>
      <input
        value={value}
        onChange={handleInputChange}
        className="rounded-md bg-slate-700 p-2"
        id={htmlFor}
        required={isRequired}
        placeholder={placeholder}
      />
    </div>
  );
};

export default NewQuestionInput;
