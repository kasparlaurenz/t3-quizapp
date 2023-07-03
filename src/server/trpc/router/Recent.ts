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

  getChapterScore: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.prisma.chapter.findFirst({
        where: {
          id: input.chapterId,
        },
      });
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

      const question = questions.map((q) => {
        const answer = answers.filter((a) => a.questionId === q.id);
        const recentAnswer = recentAnswers.find((ra) => ra.questionId === q.id);
        return {
          question: q,
          answer,
          recentAnswer,
        };
      });

      const response = {
        chapter,
        question,
      };

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

  getUserScoreForEachChapter: protectedProcedure.query(async ({ ctx }) => {
    const chapters = await ctx.prisma.chapter.findMany();

    const questions = await ctx.prisma.question.findMany({
      where: {
        chapterId: {
          in: chapters.map((c) => c.id),
        },
      },
    });

    const answers = await ctx.prisma.answer.findMany({
      where: {
        questionId: {
          in: questions.map((q) => q.id),
        },
      },
    });

    const recentAnswers = await ctx.prisma.recentUserAnswerToQuestion.findMany({
      where: {
        userId: ctx.session.user.id,
        questionId: {
          in: questions.map((q) => q.id),
        },
      },
    });

    const response = chapters.map((c) => {
      const chapterQuestions = questions.filter((q) => q.chapterId === c.id);
      const chapterRecentAnswers = recentAnswers.filter((ra) =>
        chapterQuestions.map((q) => q.id).includes(ra.questionId)
      );

      const questionsCount = chapterQuestions.length;

      const correctCount = chapterRecentAnswers.filter((ra) => ra.answerState);

      const chapterScoreInPercent = Math.round(
        (chapterRecentAnswers.filter((ra) => ra.answerState).length /
          chapterQuestions.length) *
          100
      );

      return {
        chapter: c,
        userId: ctx.session.user.id,
        chapterScoreInPercent,
        questionsCount,
        correctCount: correctCount.length,
      };
    });

    return response;
  }),
});
