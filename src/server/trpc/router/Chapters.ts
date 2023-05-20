import { z } from "zod";

import { publicProcedure, router, adminProcedure } from "../trpc";

export const chaptersRouter = router({
  createChapter: adminProcedure
    .input(
      z.object({
        chapter: z.number(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.chapter.create({
        data: {
          number: input.chapter,
          description: input.description,
        },
      });
    }),

  deleteChapter: adminProcedure
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
      include: {
        categories: true,
      },
      where: {
        isHidden: false,
      },
    });
  }),

  getAllChapters: adminProcedure.query(({ ctx }) => {
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
          id: true,
        },
      });
      return description;
    }),

  updateChapterVisibility: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isHidden: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const chapter = await ctx.prisma.chapter.update({
        where: {
          id: input.id,
        },
        data: {
          isHidden: input.isHidden,
        },
      });
      return chapter;
    }),

  addChapterToCategory: adminProcedure
    .input(
      z.object({
        chapterId: z.string(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const chapter = await ctx.prisma.chapter.update({
        where: {
          id: input.chapterId,
        },
        data: {
          categories: {
            create: [
              {
                categoryId: input.categoryId,
              },
            ],
          },
        },
      });
      return chapter;
    }),
});
