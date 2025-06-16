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

export async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "DragNChat",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch models from OpenRouter");
  }

  const data = await response.json();
  
  // Transform the response to match our interface
  return data.data.map((model: any) => ({
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
}

export function formatPrice(price: string): string {
  const numPrice = parseFloat(price);
  if (numPrice === 0) return "Free";
  if (numPrice < 0.001) return `$${(numPrice * 1000000).toFixed(2)}/1M`;
  if (numPrice < 1) return `$${(numPrice * 1000).toFixed(2)}/1K`;
  return `$${numPrice.toFixed(2)}/1K`;
}

export function getModelCapabilities(model: OpenRouterModel): string[] {
  const capabilities: string[] = [];
  
  if (model.architecture.input_modalities.includes("text")) {
    capabilities.push("Text Input");
  }
  if (model.architecture.input_modalities.includes("image")) {
    capabilities.push("Vision");
  }
  if (model.architecture.output_modalities.includes("image")) {
    capabilities.push("Image Generation");
  }
  if (model.context_length > 100000) {
    capabilities.push("Long Context");
  }
  
  return capabilities;
}
