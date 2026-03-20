import type { ForgeRequest, ForgeResponse } from "./types.js";
import { AnthropicProvider } from "./providers/AnthropicProvider.js";
import { OpenAIProvider } from "./providers/OpenAIProvider.js";

export interface LLMProvider {
  generate(request: ForgeRequest): Promise<ForgeResponse>;
}

export interface LLMProviderConfig {
  provider?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  maxTokens?: number;
}

export function createProvider(config: LLMProviderConfig = {}): LLMProvider {
  const provider = config.provider ?? process.env["LANGUAGE_FORGE_PROVIDER"] ?? "openai";

  if (provider === "openai" || provider === "local") {
    return new OpenAIProvider({
      apiKey: config.apiKey ?? process.env["LANGUAGE_FORGE_API_KEY"] ?? process.env["OPENAI_API_KEY"] ?? (provider === "local" ? "ollama" : ""),
      model: config.model ?? process.env["LANGUAGE_FORGE_MODEL"] ?? (provider === "local" ? "llama3" : "gpt-4o-mini"),
      baseUrl: config.baseUrl ?? process.env["LANGUAGE_FORGE_BASE_URL"] ?? (provider === "local" ? "http://localhost:11434/v1" : "https://api.openai.com/v1"),
      maxTokens: config.maxTokens ?? Number(process.env["LANGUAGE_FORGE_MAX_TOKENS"] ?? "2048"),
      providerName: provider,
    });
  }

  if (provider === "anthropic") {
    return new AnthropicProvider({
      apiKey: config.apiKey ?? process.env["LANGUAGE_FORGE_API_KEY"] ?? process.env["ANTHROPIC_API_KEY"] ?? "",
      model: config.model ?? process.env["LANGUAGE_FORGE_MODEL"] ?? "claude-3-5-haiku-20241022",
      maxTokens: config.maxTokens ?? Number(process.env["LANGUAGE_FORGE_MAX_TOKENS"] ?? "2048"),
    });
  }

  throw new Error(`Unsupported LANGUAGE_FORGE_PROVIDER: ${provider}`);
}
