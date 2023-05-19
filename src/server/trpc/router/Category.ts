import { z } from "zod";
import {
  protectedProcedure,
  publicProcedure,
  router,
  adminProcedure,
} from "../trpc";

export const categories = router({
  getCategories: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: {
        name: "asc",
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
});
