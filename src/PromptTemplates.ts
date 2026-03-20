import type { ForgeRequest, LanguageContext } from "./types.js";

function describeFaction(context: LanguageContext): string {
  return context.factionProfiles
    .map((profile) => {
      const family = context.protoLanguageFamilies.find((candidate) => candidate.memberFactionIds.includes(profile.factionId));
      return [
        `- ${profile.factionName} (${profile.factionId})`,
        `  - proto-family: ${family?.name ?? "independent"}`,
        `  - avg linguistic intelligence: ${profile.averageLinguisticIntelligence.toFixed(3)}`,
        `  - grammar complexity: ${profile.grammarComplexityScore}`,
        `  - contact intensity: ${profile.contactIntensity}`,
        `  - isolation score: ${profile.isolationScore}`,
        `  - shared myth themes: ${profile.sharedMythThemes.join(", ") || "none"}`,
        `  - unique myth themes: ${profile.uniqueMythThemes.join(", ") || "none"}`,
        `  - likely influences: ${profile.likelyInfluences.join(", ") || "none"}`,
      ].join("\n");
    })
    .join("\n");
}

function describeRelationships(context: LanguageContext): string {
  return context.relationships
    .map(
      (relationship) =>
        `- ${relationship.factionAId} ↔ ${relationship.factionBId}: contact=${relationship.contactScore.toFixed(2)}, standing=${relationship.standingTrend.toFixed(2)}, mythOverlap=${relationship.mythOverlap.toFixed(2)}, drift=${relationship.driftScore.toFixed(2)}, loanWords=${relationship.loanWordIndex.toFixed(2)}, label=${relationship.relationLabel}`,
    )
    .join("\n");
}

function describeMyths(context: LanguageContext): string {
  return context.notableMyths
    .map((myth) => `- tick ${myth.tick}: ${myth.theme} — ${myth.summary} [${myth.participantFactionIds.join(", ")}]`)
    .join("\n");
}

export class PromptTemplates {
  static buildLanguagePackagePrompt(context: LanguageContext): ForgeRequest {
    const systemPrompt = [
      "You are a speculative historical linguist and narrative worldbuilder.",
      "Transform simulation context into plausible language artifacts.",
      "Make outputs vivid, culturally grounded, and internally consistent.",
      "Do not mention games, prompts, JSON instructions, or modern linguistics jargon unless it helps the in-world texture.",
      "Return valid JSON only.",
    ].join(" ");

    const prompt = `Build a language package for the campaign below.

Campaign observations:
${context.globalObservations.map((item) => `- ${item}`).join("\n")}

Factions:
${describeFaction(context)}

Relationships:
${describeRelationships(context)}

Notable myths:
${describeMyths(context)}

Return JSON with this exact shape:
{
  "factionVocabulary": [
    {
      "factionId": "string",
      "factionName": "string",
      "greeting": "short phrase",
      "phonologyProfile": ["3-5 bullet-like strings"],
      "grammarNotes": ["3-5 bullet-like strings"],
      "oralTraditionExcerpt": "80-140 words of oral-tradition prose",
      "vocabulary": [
        {
          "word": "invented word",
          "meaning": "english gloss",
          "etymology": "why the word emerged",
          "usageNote": "optional short register or taboo note"
        }
      ]
    }
  ]
}

Requirements:
- Every faction in the context must appear exactly once.
- Invent 4-6 vocabulary items per faction.
- Shared proto-language families should produce some recognizable phonetic overlap.
- Hostile neighbors should create insults, taboo terms, and militarized metaphors.
- Trade-heavy neighbors should create merchant, river, border, and borrowed craft vocabulary.
- Oral tradition excerpts should sound different across factions.`;

    return { systemPrompt, prompt, responseFormat: "json" };
  }
}
