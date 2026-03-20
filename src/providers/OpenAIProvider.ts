import type { LLMProvider } from "../LLMClient.js";
import type { ForgeRequest, ForgeResponse } from "../types.js";

export interface OpenAIProviderOptions {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  providerName?: string;
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class OpenAIProvider implements LLMProvider {
  constructor(private readonly options: OpenAIProviderOptions) {}

  async generate(request: ForgeRequest): Promise<ForgeResponse> {
    if (!this.options.apiKey) {
      throw new Error("OpenAIProvider: LANGUAGE_FORGE_API_KEY or OPENAI_API_KEY is required");
    }

    const response = await fetch(`${this.options.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        model: this.options.model,
        response_format: request.responseFormat === "json" ? { type: "json_object" } : undefined,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.prompt },
        ],
        temperature: 0.9,
        max_tokens: this.options.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAIProvider: request failed with ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as OpenAIChatResponse;
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenAIProvider: empty response from chat completions API");
    }

    return {
      text,
      provider: this.options.providerName ?? "openai",
      model: this.options.model,
    };
  }
}
