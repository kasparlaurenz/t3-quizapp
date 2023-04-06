import { z } from "zod";
import { publicProcedure, router } from "../trpc";

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
});
