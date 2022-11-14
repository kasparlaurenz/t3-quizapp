import { router } from "../trpc";
import { questionsRouter } from "./Questions";

export const appRouter = router({
  question: questionsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
