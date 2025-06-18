import { z } from "zod";
import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { openrouterRouter } from "@/server/api/routers/openrouter";
import { projectsRouter } from "@/server/api/routers/projects";
import { executionRouter } from "@/server/api/routers/execution";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  health: publicProcedure.input(z.void()).query(async () => {
    return {
      message: "OK",
    };
  }),
  user: userRouter,
  openrouter: openrouterRouter,
  projects: projectsRouter,
  execution: executionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
