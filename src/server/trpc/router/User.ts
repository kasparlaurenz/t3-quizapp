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
        username: z.string(),
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
});
