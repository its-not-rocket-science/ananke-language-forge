// src/chronicle-narrator.ts — Phase 1: Battle chronicle narration
//
// Generates narrative prose from a ChronicleEntry array using the Anthropic API.
// The ChronicleEntry type is imported from @its-not-rocket-science/ananke (Tier 2 export).
//
// Usage:
//   import { narrateChronicle } from "@its-not-rocket-science/ananke-language-forge";
//   const prose = await narrateChronicle(entries, { style: "epic", maxWords: 400 });

import Anthropic from "@anthropic-ai/sdk";
// ChronicleEntry is a Tier 2 type from src/chronicle.ts (not in root barrel).
// Defined inline here to avoid a deep dist-path import that may not resolve
// across all module-resolution strategies.
export interface ChronicleEntry {
  entryId: string;
  tick: number;
  significance: number;
  eventType: string;
  actors: number[];
  template: string;
  variables: Record<string, string | number>;
  rendered?: string | undefined;
  settlementId?: string | undefined;
  questId?: string | undefined;
}

export interface NarrateChronicleOptions {
  /**
   * Prose register for the generated text.
   * - "epic"         — heroic, elevated diction; suitable for a bard's account
   * - "factual"      — neutral, reportorial; suitable for a military after-action report
   * - "mythological" — timeless, archetypal; suitable for a founding legend
   *
   * Default: "factual"
   */
  style?: "epic" | "factual" | "mythological";

  /**
   * Approximate upper word-count for the output.
   * The model is instructed to stay within this limit but may slightly exceed it.
   * Default: 300
   */
  maxWords?: number;

  /**
   * Anthropic model to use.  Defaults to claude-3-5-haiku-20241022 (fast, cheap).
   * Override to claude-opus-4-5 for higher-quality output on significant chronicles.
   */
  model?: string;

  /**
   * Optional linguisticIntelligence_Q value (0–SCALE.Q = 0–18384) from the
   * narrator entity.  Scales prose complexity:
   * - < 3000  → simple, direct language
   * - 3000–12000 → standard narrative register
   * - > 12000 → rich vocabulary, elaborate sentence structures
   *
   * Default: 9192 (q(0.50) — mid-range)
   */
  linguisticIntelligenceQ?: number;
}

const DEFAULT_MODEL = "claude-3-5-haiku-20241022";

/**
 * Generates narrative prose from a ChronicleEntry array.
 *
 * Entries are sorted by significance (descending) before being passed to the
 * model; low-significance events are included as brief mentions so the model
 * has full context without over-weighting minor occurrences.
 *
 * @throws Error if ANTHROPIC_API_KEY is not set
 * @throws Error if the entries array is empty
 */
export async function narrateChronicle(
  entries: ChronicleEntry[],
  options: NarrateChronicleOptions = {},
): Promise<string> {
  if (entries.length === 0) {
    throw new Error("narrateChronicle: entries array must not be empty");
  }

  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "narrateChronicle: ANTHROPIC_API_KEY environment variable is not set",
    );
  }

  const style = options.style ?? "factual";
  const maxWords = options.maxWords ?? 300;
  const model = options.model ?? DEFAULT_MODEL;
  const lingQ = options.linguisticIntelligenceQ ?? 9192;

  // Sort by significance descending so the model sees the most important events first
  const sorted = [...entries].sort((a, b) => b.significance - a.significance);

  const eventSummaries = sorted.map((e) => {
    const rendered = e.rendered ?? e.template;
    return `[tick ${e.tick}, significance ${e.significance}, type ${e.eventType}] ${rendered}`;
  });

  // Derive a vocabulary-level instruction from linguisticIntelligenceQ.
  // SCALE.Q = 18384; thresholds are approximate quarter-points.
  const vocabInstruction =
    lingQ < 4596
      ? "Use simple, plain language. Short sentences. No flowery vocabulary."
      : lingQ > 13788
        ? "Use rich, elevated vocabulary. Complex, varied sentence structures. Evocative imagery."
        : "Use standard narrative prose. Clear and readable.";

  const styleInstruction = {
    epic:
      "Write in an epic, heroic style — as a bard or court poet would recount the deeds of heroes.",
    factual:
      "Write in a neutral, factual style — as a military scribe or chronicler recording events for posterity.",
    mythological:
      "Write in a mythological style — timeless, archetypal, as though these events are the founding legends of a civilization.",
  }[style];

  const prompt = `You are an in-world narrator generating text for a fantasy simulation.

${styleInstruction}
${vocabInstruction}
Keep the total response under ${maxWords} words.
Do not break the fourth wall or mention game mechanics, statistics, or code.
Write only the narrative text — no titles, headers, or meta-commentary.

The following events occurred in chronological order:
${eventSummaries.join("\n")}

Write a coherent narrative account of these events.`;

  // TODO Phase 1: Replace stub with real API call
  throw new Error(
    `narrateChronicle: Not yet implemented — see ROADMAP Phase 1.\n\nPrepared prompt (${prompt.length} chars) for ${model}:\n${prompt.slice(0, 200)}...`,
  );

  // --- IMPLEMENTATION TEMPLATE (uncomment when ready) ---
  // const client = new Anthropic({ apiKey });
  // const message = await client.messages.create({
  //   model,
  //   max_tokens: Math.ceil(maxWords * 1.5),  // tokens ≈ 1.5× words (conservative)
  //   messages: [{ role: "user", content: prompt }],
  // });
  // const block = message.content[0];
  // if (block.type !== "text") throw new Error("Unexpected response type from Anthropic API");
  // return block.text.trim();
}

// Re-export Anthropic type so callers can import it from one place if needed
export type { Anthropic };
