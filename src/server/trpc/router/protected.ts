import { protectedProcedure, router } from "../trpc";

export const protectedRouter = router({
  // getSession: publicProcedure.query(({ ctx }) => {
  //   return ctx.session;
  // }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
