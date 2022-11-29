import { router } from "../trpc";
import { chaptersRouter } from "./Chapters";
import { questionsRouter } from "./Questions";

export const appRouter = router({
  question: questionsRouter,
  chapter: chaptersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
