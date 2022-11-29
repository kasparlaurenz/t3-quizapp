export type QuestionType = {
  question: string;
};

export type AnswerObjectType = {
  id: string;
  answer: string;
  is_correct: boolean;
};

export type InitialQuestionType = QuestionType & {
  wrong_answer1: { answer: string; is_correct: boolean };
  wrong_answer2: { answer: string; is_correct: boolean };
  correct_answer: { answer: string; is_correct: boolean };
  chapter?: number | null;
  description?: string;
};
