// src/myth-composer.ts — Phase 3 stub: Mythological text generation
//
// Generates founding myths, cautionary legends, and creation stories from
// StoryArc[] data produced by the Ananke chronicle system.
//
// See ROADMAP.md Phase 3 for the full implementation plan.

// StoryArc is a Tier 2 type from src/chronicle.ts (not in root barrel).
// Defined inline here to avoid a deep dist-path import that may not resolve
// across all module-resolution strategies.
export interface StoryArc {
  arcId: string;
  arcType: string;
  entryIds: string[];
  primaryActors: number[];
  startTick: number;
  endTick?: number | undefined;
  significance: number;
  description: string;
}

export interface MythComposeOptions {
  /**
   * Name of the faction or culture for whose tradition this myth is written.
   * Used to personalise references ("The People of the Iron Coast…").
   */
  factionName: string;

  /**
   * Myth register.
   * - "founding"    — creation myth / origin story of a faction
   * - "cautionary"  — a warning legend about hubris or treachery
   * - "heroic"      — a demigod-style account of a legendary individual
   *
   * Default: "founding"
   */
  mythType?: "founding" | "cautionary" | "heroic";

  /** Approximate upper word-count.  Default: 400 */
  maxWords?: number;

  /** Anthropic model to use.  Default: claude-3-5-haiku-20241022 */
  model?: string;
}

/**
 * Generates mythological text from StoryArc[] data.
 *
 * Each StoryArc's arcType ("rise_of_hero", "tragedy", "dynasty", etc.) is
 * mapped to mythic motifs that guide the generated text.
 *
 * @throws Error — Not yet implemented (see ROADMAP Phase 3)
 */
export async function composeMythText(
  arcs: StoryArc[],
  options: MythComposeOptions,
): Promise<string> {
  void arcs;
  void options;
  // TODO Phase 3: build myth prompt from arcs and call Anthropic API
  throw new Error("composeMythText: Not yet implemented — see ROADMAP Phase 3");
}
