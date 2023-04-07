import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const recentAnswers = router({
  getRecentAnswerToQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const recentAnswer = await ctx.prisma.answer.findFirst({
        where: {
          questionId: input.questionId,
        },
      });
      return recentAnswer;
    }),

  getQuestionsByChapterId: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const questions = await ctx.prisma.question.findMany({
        where: {
          chapterId: input.chapterId,
        },
        include: {
          answers: true,
        },
      });

      return questions;
    }),
});
