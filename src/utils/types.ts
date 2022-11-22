export type QuestionType = {
  question: string;
};

export type AnswerType = {
  answer: string;
};

export type AnswerObjectType = {
  id: string;
  answer: string;
  is_correct: boolean;
};

export type QuestionWithAnswers = QuestionType & {
  wrong_answer1: AnswerType;
  wrong_answer2: AnswerType;
  correct_answer: AnswerType;
  chapter: number | null;
};
