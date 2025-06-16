import "server-only";

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  setOpenRouterKey: protectedProcedure
    .input(z.object({ apiKey: z.string().min(1, "API key is required") }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user.userId) {
          throw new Error("User ID not found");
        }

        // Validate the API key by making a test request to OpenRouter
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "DragNChat",
          },
        });

        if (!response.ok) {
          throw new Error("Invalid API key");
        }

        // Save to Clerk private metadata
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(ctx.user.userId, {
          privateMetadata: {
            openrouterApiKey: input.apiKey,
          },
        });

        return { success: true };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to validate API key"
        );
      }
    }),

  getOpenRouterKeyStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user.userId) {
        return { hasApiKey: false };
      }

      const clerk = await clerkClient();
      const user = await clerk.users.getUser(ctx.user.userId);
      const hasApiKey = !!(user.privateMetadata as any)?.openrouterApiKey;
      return { hasApiKey };
    } catch (error) {
      return { hasApiKey: false };
    }
  }),

  deleteOpenRouterKey: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user.userId) {
        throw new Error("User ID not found");
      }

      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(ctx.user.userId, {
        privateMetadata: {
          openrouterApiKey: null,
        },
      });
      return { success: true };
    } catch (error) {
      throw new Error("Failed to delete API key");
    }
  }),
});
