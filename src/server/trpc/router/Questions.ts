import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const questionsRouter = router({
  getQuestions: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.question.findMany();
  }),
  getQuestionsWithAnswers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.question.findMany({
      include: {
        answers: true,
      },
    });
  }),
  getQuestionsByChapter: publicProcedure
    .input(z.object({ chapter: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.question.findMany({
        where: {
          chapter: {
            number: input.chapter,
          },
        },
      });
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
        chapter: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.question.create({
          data: {
            question: input.question,
            imageUrl: input.imageUrl,
            imageName: input.imageName,
            chapter: {
              connectOrCreate: {
                where: {
                  number: input.chapter,
                },
                create: {
                  number: input.chapter,
                },
              },
            },
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
  getChapters: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.chapter.findMany({
      orderBy: {
        number: "asc",
      },
    });
  }),
  deleteChapter: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const chapter = await ctx.prisma.chapter.delete({
        where: {
          id: input.id,
        },
        include: {
          questions: true,
        },
      });
      return chapter;
    }),
  createChapter: publicProcedure
    .input(
      z.object({
        chapter: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapter.create({
          data: {
            number: input.chapter,
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
});
