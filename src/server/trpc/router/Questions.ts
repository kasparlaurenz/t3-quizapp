import { z } from "zod";
import { shuffle } from "../../../utils/shuffle";

import { publicProcedure, router } from "../trpc";

export const questionsRouter = router({
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
        description: z.string(),
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
                  description: input.description,
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
  getQuestions: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.question.findMany();
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
        orderBy: {
          createdAt: "asc",
        },
        include: {
          chapter: {
            select: {
              description: true,
            },
          },
        },
      });
    }),

  getQuestionById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.question.findUnique({
        where: {
          id: input.id,
        },
        include: {
          answers: true,
        },
      });
    }),
  getQuestionsWithAnswersByChapterSelection: publicProcedure
    .input(z.object({ chapter: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const questions = await ctx.prisma.question.findMany({
        where: {
          chapter: {
            number: {
              in: input.chapter,
            },
          },
        },
        include: {
          answers: true,
        },
      });

      const shuffledQuestions = shuffle(questions);

      const shuffledQuestionsWithShuffledAnswers = shuffledQuestions.map(
        (question) => {
          return {
            ...question,
            answers: shuffle(question.answers),
          };
        }
      );
      return shuffledQuestionsWithShuffledAnswers;
    }),

  updateQuestion: publicProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string(),
        incorrect_one: z.string(),
        incorrect_two: z.string(),
        correct: z.string(),
        imageUrl: z.string().optional(),
        imageName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.question.update({
          where: {
            id: input.id,
          },
          data: {
            question: input.question,
            imageUrl: input.imageUrl,
            imageName: input.imageName,
            answers: {
              updateMany: [
                {
                  where: {
                    questionId: input.id,
                    is_correct: false,
                  },
                  data: {
                    answer: input.incorrect_one,
                  },
                },
                {
                  where: {
                    questionId: input.id,
                    is_correct: false,
                  },
                  data: {
                    answer: input.incorrect_two,
                  },
                },
                {
                  where: {
                    questionId: input.id,
                    is_correct: true,
                  },
                  data: {
                    answer: input.correct,
                  },
                },
              ],
            },
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),

  deleteImageOfQuestion: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.question.update({
          where: {
            id: input.id,
          },
          data: {
            imageUrl: "",
            imageName: "",
          },
        });
      } catch (error) {
        console.log(error);
      }
    }),
});

// getQuestionsWithAnswers: publicProcedure.query(({ ctx }) => {
//   return ctx.prisma.question.findMany({
//     include: {
//       answers: true,
//     },
//   });
// }),

// getQuestionsWithAnswersByChapter: publicProcedure
//   .input(z.object({ chapter: z.number() }))
//   .query(async ({ ctx, input }) => {
//     return ctx.prisma.question.findMany({
//       where: {
//         chapter: {
//           number: input.chapter,
//         },
//       },
//       include: {
//         answers: true,
//       },
//       orderBy: {
//         createdAt: "asc",
//       },
//     });
//   }),
