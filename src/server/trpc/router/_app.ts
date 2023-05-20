import { router } from "../trpc";
import { authRouter } from "./auth";
import { categories } from "./Category";
import { chaptersRouter } from "./Chapters";
import { questionsRouter } from "./Questions";
import { recentAnswers } from "./Recent";
import { userRouter } from "./User";

export const appRouter = router({
  question: questionsRouter,
  chapter: chaptersRouter,
  auth: authRouter,
  user: userRouter,
  recent: recentAnswers,
  category: categories,
});

// export type definition of API
export type AppRouter = typeof appRouter;
