import { z } from "zod";

import { publicProcedure, router, adminProcedure } from "../trpc";
import { trpc } from "../../../utils/trpc";

export const chaptersRouter = router({
  createChapter: adminProcedure
    .input(
      z.object({
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.chapter.create({
        data: {
          number: (await ctx.prisma.chapter.count()) + 1,
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

  updateChapterPosition: adminProcedure
    .input(
      z.object({
        id: z.string(),
        position: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentChapter = await ctx.prisma.chapter.findFirst({
        where: {
          number: input.position,
        },
      });

      if (!currentChapter) {
        throw new Error("Chapter not found");
      }

      const newPosition = currentChapter.number;

      await ctx.prisma.chapter.update({
        where: {
          id: currentChapter.id,
        },
        data: {
          number: -100,
        },
      });

      const chapter = await ctx.prisma.chapter.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      const oldPosition = chapter.number;

      await ctx.prisma.chapter.update({
        where: {
          id: input.id,
        },
        data: {
          number: newPosition,
        },
      });

      await ctx.prisma.chapter.update({
        where: {
          id: currentChapter.id,
        },
        data: {
          number: oldPosition,
        },
      });
    }),
});
