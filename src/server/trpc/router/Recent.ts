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

  getResponse: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const questions = await ctx.prisma.question.findMany({
        where: {
          chapterId: input.chapterId,
        },
      });

      const answers = await ctx.prisma.answer.findMany({
        where: {
          questionId: {
            in: questions.map((q) => q.id),
          },
        },
      });

      const recentAnswers =
        await ctx.prisma.recentUserAnswerToQuestion.findMany({
          where: {
            userId: ctx.session.user.id,
            questionId: {
              in: questions.map((q) => q.id),
            },
          },
        });

      const response = questions.map((q) => {
        const answer = answers.filter((a) => a.questionId === q.id);
        const recentAnswer = recentAnswers.find((ra) => ra.questionId === q.id);
        return {
          question: q,
          answer,
          recentAnswer,
        };
      });

      return response;
    }),

  resetStatesOfChapter: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.recentUserAnswerToQuestion.updateMany({
        where: {
          userId: ctx.session.user.id,
          chapterId: input.chapterId,
        },
        data: {
          answerState: false,
        },
      });
    }),
});
