import { router } from "../trpc";
import { authRouter } from "./auth";
import { chaptersRouter } from "./Chapters";
import { questionsRouter } from "./Questions";
import { userRouter } from "./User";

export const appRouter = router({
  question: questionsRouter,
  chapter: chaptersRouter,
  auth: authRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
