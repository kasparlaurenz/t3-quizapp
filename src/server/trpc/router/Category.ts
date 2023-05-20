import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  adminProcedure,
} from "../trpc";

export const categories = router({
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  getCategories: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        isHidden: false,
      },
    });
  }),

  createNewCategory: adminProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.category.create({
        data: {
          name: input.name,
        },
      });
    }),

  deleteCategory: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.category.delete({
        where: {
          id: input.id,
        },
      });
    }),

  updateCategoryVisibility: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isHidden: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.category.update({
        where: {
          id: input.id,
        },
        data: {
          isHidden: input.isHidden,
        },
      });
    }),

  getCategoriesOfChapter: adminProcedure
    .input(
      z.object({
        chapterId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.category.findMany({
        where: {
          chapters: {
            some: {
              chapterId: input.chapterId,
            },
          },
        },
      });
    }),

  removeCategoryFromChapter: adminProcedure
    .input(
      z.object({
        chapterId: z.string(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.prisma.category.update({
        where: {
          id: input.categoryId,
        },
        data: {
          chapters: {
            delete: [
              {
                chapterId_categoryId: {
                  chapterId: input.chapterId,
                  categoryId: input.categoryId,
                },
              },
            ],
          },
        },
      });
      return category;
    }),
});
