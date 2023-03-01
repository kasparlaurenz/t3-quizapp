export type QuestionType = {
  question: string;
};

export type AnswerObjectType = {
  id: string;
  answer: string;
  is_correct: boolean;
};

export type InitialQuestionType = QuestionType & {
  wrong_answer1: AnswerObjectType;
  wrong_answer2: AnswerObjectType;
  correct_answer: AnswerObjectType;
  chapter?: number | null;
  description?: string;
};

export type ChapterType = {
  number: number;
  description: string;
};

export type ResultList = {
  answer: string;
  isCorrect: boolean;
  chapterDescription: string;
  chapterNumber: number;
};
