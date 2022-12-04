import { router } from "../trpc";
import { authRouter } from "./auth";
import { chaptersRouter } from "./Chapters";
import { questionsRouter } from "./Questions";

export const appRouter = router({
  question: questionsRouter,
  chapter: chaptersRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
