// src/tools/forge.ts — CLI demo for ananke-language-forge
//
// Loads a hardcoded ChronicleEntry[] fixture and calls narrateChronicle().
// Demonstrates Phase 1 functionality once the implementation is complete.
//
// Run with:
//   npm run build && npm run run:forge

import type { ChronicleEntry } from "@its-not-rocket-science/ananke";
import { narrateChronicle } from "../chronicle-narrator.js";

// ── Fixture data ──────────────────────────────────────────────────────────────
// A minimal chronicle of a skirmish between two groups.
// In production this would be loaded from a serialized WorldState or Chronicle.

const FIXTURE_ENTRIES: ChronicleEntry[] = [
  {
    entryId: "entry-001",
    tick: 120,
    significance: 45,
    eventType: "combat_victory",
    actors: [1, 2],
    template: "{actor0} defeats {actor1} in single combat",
    variables: { actor0: "Sir Aldric", actor1: "Dravan the Blade" },
    rendered: "Sir Aldric defeats Dravan the Blade in single combat",
  },
  {
    entryId: "entry-002",
    tick: 118,
    significance: 30,
    eventType: "combat_defeat",
    actors: [3],
    template: "{actor0} is driven from the field",
    variables: { actor0: "Dravan's warband" },
    rendered: "Dravan's warband is driven from the field",
  },
  {
    entryId: "entry-003",
    tick: 95,
    significance: 80,
    eventType: "legendary_deed",
    actors: [1],
    template: "{actor0} holds the bridge alone against seven foes",
    variables: { actor0: "Sir Aldric" },
    rendered: "Sir Aldric holds the bridge alone against seven foes",
  },
  {
    entryId: "entry-004",
    tick: 200,
    significance: 60,
    eventType: "settlement_raided",
    actors: [2],
    template: "{actor0} raids {location}",
    variables: { actor0: "Dravan the Blade", location: "the village of Coldfen" },
    rendered: "Dravan the Blade raids the village of Coldfen",
    settlementId: "settlement-coldfen",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("ananke-language-forge — Chronicle Narrator demo");
  console.log("=".repeat(50));
  console.log(`Loaded ${FIXTURE_ENTRIES.length} chronicle entries.`);
  console.log("Calling narrateChronicle with style: epic ...\n");

  try {
    const prose = await narrateChronicle(FIXTURE_ENTRIES, {
      style: "epic",
      maxWords: 250,
      linguisticIntelligenceQ: 14000, // High linguistic intelligence → ornate prose
    });
    console.log("Generated narrative:\n");
    console.log(prose);
  } catch (err) {
    // Expected until Phase 1 is implemented
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
