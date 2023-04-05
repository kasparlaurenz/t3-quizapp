import { z } from "zod";
import { shuffle } from "../../../utils/shuffle";

import { adminProcedure, publicProcedure, router } from "../trpc";

export const recentAnswers = router({
  getRecentAnswersOfChatper: publicProcedure
    .input(
      z.object({
        chapterNumber: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const chapter = await ctx.prisma.chapter.findFirst({
        where: {
          number: input.chapterNumber,
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      const recentAnswersToChapter =
        await ctx.prisma.recentUserAnswerToQuestion.findMany({
          where: {
            chapterId: chapter.id,
          },
        });

      const questionToRecentAnswers = new Map();

      for (const recentAnswer of recentAnswersToChapter) {
        const question = await ctx.prisma.question.findUnique({
          where: {
            id: recentAnswer.questionId,
          },
          select: {
            id: true,
            question: true,
            answers: {
              select: {
                answer: true,
                is_correct: true,
              },
            },
          },
        });

        if (question) {
          const questionId = question.id;
          console.log("QUESTION", question);

          if (questionToRecentAnswers.has(questionId)) {
            questionToRecentAnswers.get(questionId).push(recentAnswer);
          } else {
            questionToRecentAnswers.set(questionId, [question]);
            questionToRecentAnswers.set(questionId, [question]);
          }
        }
      }

      console.log("QUESTIONS", questionToRecentAnswers.entries());
    }),
});
