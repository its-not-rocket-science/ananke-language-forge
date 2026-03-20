import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { CampaignReader } from "../src/CampaignReader.js";
import { LanguageContextBuilder } from "../src/LanguageContextBuilder.js";
import { PromptTemplates } from "../src/PromptTemplates.js";
import { OutputParser } from "../src/OutputParser.js";

const EXAMPLE_JSON = readFileSync(new URL("../examples/campaign.json", import.meta.url), "utf8");

describe("language forge pipeline", () => {
  it("reads the example campaign and preserves core structures", () => {
    const campaign = CampaignReader.fromJson(EXAMPLE_JSON);
    expect(campaign.factions).toHaveLength(3);
    expect(campaign.contactPairs[0]?.factionAId).toBe("thornwall_militia");
    expect(campaign.mythEvents.map((myth) => myth.theme)).toContain("forbidden_name");
  });

  it("builds a context with relationships, families, and observations", () => {
    const campaign = CampaignReader.fromJson(EXAMPLE_JSON);
    const context = LanguageContextBuilder.build(campaign);
    expect(context.factionProfiles).toHaveLength(3);
    expect(context.relationships).toHaveLength(3);
    expect(context.protoLanguageFamilies.length).toBeGreaterThan(0);
    expect(context.globalObservations.length).toBeGreaterThan(0);
  });

  it("builds a prompt that asks for structured JSON", () => {
    const campaign = CampaignReader.fromJson(EXAMPLE_JSON);
    const context = LanguageContextBuilder.build(campaign);
    const request = PromptTemplates.buildLanguagePackagePrompt(context);
    expect(request.responseFormat).toBe("json");
    expect(request.prompt).toContain("Return JSON with this exact shape");
    expect(request.prompt).toContain("Every faction in the context must appear exactly once");
  });

  it("parses a provider response into a language package", () => {
    const campaign = CampaignReader.fromJson(EXAMPLE_JSON);
    const context = LanguageContextBuilder.build(campaign);
    const response = {
      factionVocabulary: context.factionProfiles.map((profile) => ({
        factionId: profile.factionId,
        factionName: profile.factionName,
        greeting: "Varesh tol.",
        phonologyProfile: ["prefers clustered consonants", "long open vowels"],
        grammarNotes: ["ceremonial second person", "trade nouns borrow freely"],
        oralTraditionExcerpt: "They say the river keeps the memory of each oath, carrying broken promises back to the speaker when the moon is thin.",
        vocabulary: [
          {
            word: `${profile.factionId}-word`,
            meaning: "test term",
            etymology: "invented in a unit test",
            usageNote: "used only in formal recitation"
          }
        ]
      }))
    };

    const parsed = OutputParser.parseLanguagePackage(JSON.stringify(response), context, {
      provider: "openai",
      model: "gpt-4o-mini",
    });

    expect(parsed.factionVocabulary).toHaveLength(3);
    expect(parsed.languageFamilyTree.protoLanguages.length).toBeGreaterThan(0);
    expect(parsed.promptMetadata.provider).toBe("openai");
  });
});
