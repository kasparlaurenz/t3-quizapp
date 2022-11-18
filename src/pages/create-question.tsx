import { NextPage } from "next";
import Link from "next/link";
import type { FC } from "react";
import { useState } from "react";
import NewQuestionInput from "../components/NewQuestionInput";
import { trpc } from "../utils/trpc";
import type { QuestionWithAnswers } from "../utils/types";

const initialQuestionState = {
  question: "",
  correct_answer: { answer: "", is_correct: true },
  wrong_answer1: { answer: "", is_correct: false },
  wrong_answer2: { answer: "", is_correct: false },
};

const CreateQuestion: NextPage = () => {
  const [newQuestion, setNewQuestion] =
    useState<QuestionWithAnswers>(initialQuestionState);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleModal = () => {
    setShowConfirm((prev) => !prev);
  };

  const createNewQuestion = trpc.question.createQuestion.useMutation();
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <Link className="reg-button mb-8 w-fit" href="/">
        Return home
      </Link>
      {showConfirm && (
        <>
          <ConfirmModal handleModal={handleModal} />
          <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
        </>
      )}
      <form
        className="w-1/2"
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          createNewQuestion.mutate({
            question: newQuestion.question,
            incorrect_one: newQuestion.wrong_answer1.answer,
            incorrect_two: newQuestion.wrong_answer2.answer,
            correct: newQuestion.correct_answer.answer,
          });
          setShowConfirm(true);
          setNewQuestion(initialQuestionState);
        }}
      >
        <NewQuestionInput
          setNewQuestion={setNewQuestion}
          htmlFor="question"
          value={newQuestion.question}
        >
          Your Question
        </NewQuestionInput>
        <NewQuestionInput
          setNewQuestion={setNewQuestion}
          htmlFor="wrong_answer1"
          value={newQuestion.wrong_answer1.answer}
        >
          Wrong Answer 1
        </NewQuestionInput>
        <NewQuestionInput
          setNewQuestion={setNewQuestion}
          htmlFor="wrong_answer2"
          value={newQuestion.wrong_answer2.answer}
        >
          Wrong Answer 2
        </NewQuestionInput>
        <NewQuestionInput
          setNewQuestion={setNewQuestion}
          htmlFor="correct_answer"
          value={newQuestion.correct_answer.answer}
        >
          Correct Answer
        </NewQuestionInput>
        <div className="flex flex-col">
          <label htmlFor="image">Upload Image</label>
          <input type="file" />
        </div>
        <button type="submit" className="reg-button mt-8 w-fit">
          Create Question
        </button>
      </form>
    </main>
  );
};

interface ConfirmModalProps {
  handleModal: () => void;
}
const ConfirmModal: FC<ConfirmModalProps> = ({ handleModal }) => {
  return (
    <div className="absolute z-50">
      <p className="text-lg">Question has been created</p>
      <button onClick={handleModal} className="reg-button">
        Close
      </button>
    </div>
  );
};

export default CreateQuestion;
