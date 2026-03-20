import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider } from "../LLMClient.js";
import type { ForgeRequest, ForgeResponse } from "../types.js";

export interface AnthropicProviderOptions {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export class AnthropicProvider implements LLMProvider {
  constructor(private readonly options: AnthropicProviderOptions) {}

  async generate(request: ForgeRequest): Promise<ForgeResponse> {
    if (!this.options.apiKey) {
      throw new Error("AnthropicProvider: LANGUAGE_FORGE_API_KEY or ANTHROPIC_API_KEY is required");
    }

    const client = new Anthropic({ apiKey: this.options.apiKey });
    const response = await client.messages.create({
      model: this.options.model,
      max_tokens: this.options.maxTokens,
      system: request.systemPrompt,
      messages: [{ role: "user", content: request.prompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("AnthropicProvider: response did not include a text block");
    }

    return {
      text: textBlock.text.trim(),
      provider: "anthropic",
      model: this.options.model,
    };
  }
}
