// src/dialogue-generator.ts — Phase 4 stub: Per-entity NPC dialogue generation
//
// Generates contextual NPC speech calibrated by the entity's linguisticIntelligence_Q
// attribute from the Ananke IndividualAttributes model.
//
// linguisticIntelligence_Q is a Q-unit value (0–SCALE.Q = 0–18384):
//   - Low values  → halting, simple speech; limited vocabulary
//   - High values → articulate, nuanced; richer sentence structures
//
// See ROADMAP.md Phase 4 for the full implementation plan.

import type { Entity } from "@its-not-rocket-science/ananke";

export interface DialogueOptions {
  /**
   * A short description of the scene context in which the NPC is speaking.
   * Example: "The player has just asked for directions to the market."
   */
  sceneContext: string;

  /**
   * Optional recent chronicle entries involving this entity, as rendered strings.
   * Used to make dialogue reflect the NPC's recent experiences.
   */
  recentHistory?: string[];

  /**
   * Maximum number of sentences to generate.  Default: 3
   */
  maxSentences?: number;

  /** Anthropic model to use.  Default: claude-3-5-haiku-20241022 */
  model?: string;
}

/**
 * Generates contextual dialogue for an NPC entity.
 *
 * The entity's linguisticIntelligence_Q (read from
 * entity.attributes?.cognition?.linguisticVerbal) calibrates vocabulary
 * complexity and sentence structure.  If the entity has no cognition block,
 * a mid-range value (q(0.50)) is assumed.
 *
 * @throws Error — Not yet implemented (see ROADMAP Phase 4)
 */
export async function generateDialogue(
  entity: Entity,
  options: DialogueOptions,
): Promise<string> {
  void entity;
  void options;
  // TODO Phase 4: extract linguisticIntelligence_Q, build dialogue prompt, call API
  throw new Error("generateDialogue: Not yet implemented — see ROADMAP Phase 4");
}
