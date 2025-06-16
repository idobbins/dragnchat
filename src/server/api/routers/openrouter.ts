import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  architecture: {
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
  };
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
  };
  context_length: number;
  supported_parameters: string[];
}

export const openrouterRouter = createTRPCRouter({
  getModels: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user.userId) {
        throw new Error("User ID not found");
      }

      // Get the user's API key from Clerk private metadata
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(ctx.user.userId);
      const apiKey = (user.privateMetadata as any)?.openrouterApiKey;

      if (!apiKey) {
        throw new Error("OpenRouter API key not found. Please add your API key in your profile.");
      }

      // Fetch models from OpenRouter
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "DragNChat",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models from OpenRouter");
      }

      const data = await response.json();
      
      // Transform the response to match our interface
      const models: OpenRouterModel[] = data.data.map((model: any) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || "",
        architecture: {
          input_modalities: model.architecture?.input_modalities || ["text"],
          output_modalities: model.architecture?.output_modalities || ["text"],
          tokenizer: model.architecture?.tokenizer || "unknown",
        },
        pricing: {
          prompt: model.pricing?.prompt || "0",
          completion: model.pricing?.completion || "0",
          image: model.pricing?.image,
        },
        context_length: model.context_length || 0,
        supported_parameters: model.supported_parameters || [],
      }));

      return { models };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch models"
      );
    }
  }),

  validateApiKey: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${input.apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "DragNChat",
          },
        });

        return { valid: response.ok };
      } catch (error) {
        return { valid: false };
      }
    }),
});
