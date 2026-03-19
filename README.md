# ananke-language-forge

LLM-powered language generation from [Ananke](https://github.com/its-not-rocket-science/ananke)
faction history and mythology.

Reads simulation state — `ChronicleEntry[]`, `StoryArc[]`, faction standing data — and uses the
Claude API to produce authentic in-world texts: battle reports, legends, faction proclamations,
and NPC dialogue calibrated by `linguisticIntelligence_Q`.

---

## Prerequisites

- Node.js 18+
- An Ananke simulation producing `ChronicleEntry[]` data (see the
  [Ananke integration primer](https://github.com/its-not-rocket-science/ananke/blob/main/docs/integration-primer.md))
- An Anthropic API key with access to Claude

---

## Install

```bash
npm install
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY
```

---

## Quick start

```bash
npm run build
npm run run:forge
```

This runs `src/tools/forge.ts`, which loads a hardcoded `ChronicleEntry[]` fixture and prints
generated narrative prose to stdout.

---

## What it generates

| Generator | Input | Output |
|---|---|---|
| `narrateChronicle` | `ChronicleEntry[]` + style option | Battle chronicle in epic / factual / mythological prose |
| `composeMythText` | `StoryArc[]` + faction name | Founding myth or legend text |
| `generateDialogue` | `Entity` + `linguisticIntelligence_Q` | Contextual NPC speech |

---

## How it works

1. **Read simulation state** — `ChronicleEntry[]` from the Ananke `Chronicle` object, or
   `StoryArc[]` from `detectStoryArcs()`.
2. **Build a prompt** — entries are serialised to a structured context block describing the
   actors, event types, significance scores, and rendered template text.
3. **Call Claude** — the Anthropic SDK sends the prompt to `claude-3-5-haiku-20241022` (default)
   or any model you configure.
4. **Return prose** — the generated text is returned as a plain string; no simulation state is
   mutated.

The `linguisticIntelligence_Q` value on the narrator entity (if provided) scales prompt
vocabulary complexity: q(0.30) → simple soldier's account; q(0.90) → ornate court chronicle.

---

## API key setup

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or place it in `.env` (never commit that file).

---

## Link

Core simulation engine: https://github.com/its-not-rocket-science/ananke
