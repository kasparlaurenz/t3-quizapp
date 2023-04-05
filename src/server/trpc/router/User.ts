import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

const SALT_ROUNDS = 10;

export const userRouter = router({
  getUserById: protectedProcedure.query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
    return user;
  }),
  updateUser: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3),
        previousPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (input.newPassword === "") {
        input.newPassword = input.previousPassword;
      }

      const isPasswordValid = await bcrypt.compare(
        input.previousPassword,
        user.password
      );
      if (!isPasswordValid) {
        throw new TRPCError({
          message: "Invalid password",
          code: "UNAUTHORIZED",
        });
      }
      const salt = bcrypt.genSaltSync(SALT_ROUNDS);
      const hash = bcrypt.hashSync(input.newPassword, salt);
      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          username: input.username,
          password: hash,
        },
      });
      return updatedUser;
    }),

  updateRecentAnswerToQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        answerState: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }

      const question = await ctx.prisma.question.findUnique({
        where: {
          id: input.questionId,
        },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      const recentAnswer =
        await ctx.prisma.recentUserAnswerToQuestion.findFirst({
          where: {
            userId: ctx.session.user.id,
            questionId: input.questionId,
          },
        });

      if (recentAnswer) {
        const updatedRecentAnswer =
          await ctx.prisma.recentUserAnswerToQuestion.update({
            where: {
              id: recentAnswer.id,
            },
            data: {
              answerState: input.answerState,
            },
          });
        return updatedRecentAnswer;
      } else {
        const newRecentAnswer =
          await ctx.prisma.recentUserAnswerToQuestion.create({
            data: {
              userId: ctx.session.user.id,
              questionId: input.questionId,
              answerState: input.answerState,
            },
          });
        return newRecentAnswer.id;
      }
    }),
});
