// OpenRouter API integration for model execution

import type { OpenRouterModel } from "@/server/api/routers/openrouter";
import type { ModelExecutionParams } from "./types";
import { DEFAULT_MODEL_PARAMS } from "./types";

export interface OpenRouterExecutionRequest {
  model: OpenRouterModel;
  inputText: string;
  apiKey: string;
  params?: ModelExecutionParams;
}

export interface OpenRouterExecutionResponse {
  success: boolean;
  result?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Execute a model via OpenRouter API
 */
export async function executeOpenRouterModel(
  request: OpenRouterExecutionRequest
): Promise<OpenRouterExecutionResponse> {
  try {
    const params = { ...DEFAULT_MODEL_PARAMS, ...request.params };
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${request.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "DragNChat",
      },
      body: JSON.stringify({
        model: request.model.id,
        messages: [
          {
            role: "user",
            content: request.inputText,
          },
        ],
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        top_p: params.topP,
        frequency_penalty: params.frequencyPenalty,
        presence_penalty: params.presencePenalty,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // If we can't parse the error, use the status text
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const data = await response.json();
    
    // Extract the response text
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: "No content returned from model",
      };
    }

    // Extract usage information if available
    const usage = data.usage ? {
      promptTokens: data.usage.prompt_tokens || 0,
      completionTokens: data.usage.completion_tokens || 0,
      totalTokens: data.usage.total_tokens || 0,
    } : undefined;

    return {
      success: true,
      result: content,
      usage,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validate OpenRouter API key
 */
export async function validateOpenRouterApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "DragNChat",
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get available models from OpenRouter
 */
export async function getOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "DragNChat",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    return [];
  }
}
