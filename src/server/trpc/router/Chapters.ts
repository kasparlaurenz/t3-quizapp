import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const chaptersRouter = router({
  createChapter: publicProcedure
    .input(
      z.object({
        chapter: z.number(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.chapter.create({
          data: {
            number: input.chapter,
            description: input.description,
          },
        });
      } catch (error) {
        console.log(error);
      }
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

  getChapters: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.chapter.findMany({
      orderBy: {
        number: "asc",
      },
    });
  }),

  getChapterDesc: publicProcedure
    .input(
      z.object({
        chapter: z.number(),
      })
    )
    .query(({ input, ctx }) => {
      const description = ctx.prisma.chapter.findFirst({
        where: {
          number: input.chapter,
        },
        select: {
          description: true,
        },
      });
      return description;
    }),
});
