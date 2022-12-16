import { registerSchema } from "../../../utils/authValidation";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

import { router, publicProcedure } from "../trpc";

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;

      const exists = await ctx.prisma.user.findFirst({
        where: { username },
      });

      if (password.length < 4) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password must be at least 4 characters long.",
        });
      }

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const salt = bcrypt.genSaltSync(SALT_ROUNDS);
      const hash = bcrypt.hashSync(password, salt);

      const result = await ctx.prisma.user.create({
        data: { username, password: hash },
      });

      return {
        status: 201,
        message: "Account created successfully",
        result: result.username,
      };
    }),
});
