import { z } from "zod";

import { publicProcedure, router, adminProcedure } from "../trpc";

export const chaptersRouter = router({
  createChapter: adminProcedure
    .input(
      z.object({
        chapter: z.number(),
        description: z.string(),
        isOriginal: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.chapter.create({
        data: {
          number: input.chapter,
          description: input.description,
          isOriginal: input.isOriginal,
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
    console.log("getChapters", ctx.session);
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
          isOriginal: true,
        },
      });
      return description;
    }),
});
