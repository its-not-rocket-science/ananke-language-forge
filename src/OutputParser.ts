import type { GeneratedFactionLanguage, LanguageContext, LanguagePackage } from "./types.js";

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }
  return text.trim();
}

export class OutputParser {
  static parseLanguagePackage(
    text: string,
    context: LanguageContext,
    metadata: { provider: string; model: string },
  ): LanguagePackage {
    const raw = JSON.parse(extractJsonBlock(text)) as { factionVocabulary?: GeneratedFactionLanguage[] };
    const factionVocabulary = raw.factionVocabulary ?? [];

    return {
      campaignId: context.campaignId,
      generatedAt: new Date().toISOString(),
      languageFamilyTree: { protoLanguages: context.protoLanguageFamilies },
      factionVocabulary,
      grammarComplexityScores: Object.fromEntries(
        context.factionProfiles.map((profile) => [profile.factionId, profile.grammarComplexityScore]),
      ),
      loanWordContaminationIndex: Object.fromEntries(
        context.relationships.map((relationship) => [
          `${relationship.factionAId}:${relationship.factionBId}`,
          Number(relationship.loanWordIndex.toFixed(3)),
        ]),
      ),
      promptMetadata: metadata,
    };
  }
}
