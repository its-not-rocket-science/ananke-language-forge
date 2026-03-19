# ananke-language-forge — Roadmap

## Phase 1 (current): Battle chronicle narration

Accepts a `ChronicleEntry[]` array and generates a narrative account of the events.

- `narrateChronicle(entries, { style, maxWords })` → `Promise<string>`
- Style options: `"epic"` | `"factual"` | `"mythological"`
- Entries are ranked by significance score; low-significance events are summarised
- Model: `claude-3-5-haiku-20241022` by default; configurable

## Phase 2: Faction proclamations

Uses faction standing data and faction personality profile to write formal proclamations,
declarations of war, treaties, and edicts in the faction's voice.

- Input: `FactionStanding`, `ChronicleEntry[]` filtered to faction scope
- Output: a formatted proclamation text with title and body

## Phase 3: Mythological texts

Takes `compressMythsFromHistory` output (or raw `StoryArc[]` of type `"rise_of_hero"`,
`"tragedy"`, `"dynasty"` etc.) and generates founding myths, cautionary legends, and creation
stories appropriate to the faction's culture.

- Input: `StoryArc[]`, faction name, optional creation myth seed
- Output: mythological prose

## Phase 4: Per-entity NPC dialogue

Generates contextual speech for individual NPCs, using `linguisticIntelligence_Q` as a fluency
parameter that shapes vocabulary level, sentence structure, and dialect markers.

- Input: `Entity`, scene context string, recent `ChronicleEntry[]` for the entity
- `linguisticIntelligence_Q < q(0.30)` → halting, simple speech
- `linguisticIntelligence_Q > q(0.75)` → articulate, nuanced speech
- Returns a short string (1-4 sentences) suitable for display in a game dialogue box

## Phase 5: Multi-language generation

Different factions write in distinctly different styles: militaristic factions produce terse
tactical reports; scholarly factions produce elaborate annotated histories; nomadic factions
produce oral-tradition-style verse.

- Faction personality → system prompt persona
- Support for generating parallel texts (e.g. the "same battle" from two faction perspectives)
- Optional: transliterated pseudo-conlang flavor text for exotic factions
