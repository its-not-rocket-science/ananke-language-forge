// src/index.ts — ananke-language-forge public API

export { narrateChronicle, type NarrateChronicleOptions } from "./chronicle-narrator.js";
export { composeMythText, type MythComposeOptions } from "./myth-composer.js";
export { generateDialogue, type DialogueOptions } from "./dialogue-generator.js";
export { CampaignReader } from "./CampaignReader.js";
export { LanguageContextBuilder } from "./LanguageContextBuilder.js";
export { PromptTemplates } from "./PromptTemplates.js";
export { createProvider, type LLMProvider, type LLMProviderConfig } from "./LLMClient.js";
export { OutputParser } from "./OutputParser.js";
export type {
  CampaignExport,
  CampaignFaction,
  CampaignEntity,
  CampaignContactPair,
  CampaignStandingHistory,
  CampaignMythEvent,
  LanguageContext,
  LanguagePackage,
  ForgeRequest,
  ForgeResponse,
  GeneratedFactionLanguage,
  GeneratedVocabularyItem,
  FactionLanguageProfile,
  LanguageRelationship,
  ProtoLanguageFamily,
} from "./types.js";
