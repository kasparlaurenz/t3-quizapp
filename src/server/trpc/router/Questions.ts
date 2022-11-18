import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const questionsRouter = router({
  getQuestionsWithAnswers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.question.findMany({
      include: {
        answers: true,
      },
    });
  }),
  getQuestions: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.question.findMany();
  }),
  createQuestion: publicProcedure
    .input(
      z.object({
        question: z.string(),
        incorrect_one: z.string(),
        incorrect_two: z.string(),
        correct: z.string(),
        imageUrl: z.string(),
        imageName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.question.create({
          data: {
            question: input.question,
            imageUrl: input.imageUrl,
            imageName: input.imageName,
            answers: {
              create: [
                { answer: input.incorrect_one, is_correct: false },
                { answer: input.incorrect_two, is_correct: false },
                { answer: input.correct, is_correct: true },
              ],
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
  deleteQuestion: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const question = await ctx.prisma.question.delete({
        where: {
          id: input.id,
        },
        include: {
          answers: true,
        },
      });
      return question;
    }),
});
