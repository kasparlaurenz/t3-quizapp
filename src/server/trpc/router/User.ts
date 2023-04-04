import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

const SALT_ROUNDS = 10;

export const userRouter = router({
  getUserById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });
      return user;
    }),
  updateUserName: publicProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          username: input.username,
        },
      });
      return user;
    }),
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string().min(3),
        previousPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
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
          id: input.id,
        },
        data: {
          username: input.username,
          password: hash,
        },
      });
      return updatedUser;
    }),

  updateRecentAnswerToQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
        userId: z.string(),
        answerState: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
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
            userId: input.userId,
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
              userId: input.userId,
              questionId: input.questionId,
              answerState: input.answerState,
            },
          });
        return newRecentAnswer.id;
      }
    }),
});
