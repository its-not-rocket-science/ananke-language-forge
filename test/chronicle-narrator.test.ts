// test/chronicle-narrator.test.ts — Phase 1 tests for chronicle-narrator
//
// These tests confirm the public API shape and stub behaviour without hitting
// the Anthropic API (no ANTHROPIC_API_KEY required in CI).

import { describe, it, expect } from "vitest";
import type { ChronicleEntry } from "@its-not-rocket-science/ananke";
import { narrateChronicle, type NarrateChronicleOptions } from "../src/chronicle-narrator.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SINGLE_ENTRY: ChronicleEntry[] = [
  {
    entryId: "test-001",
    tick: 10,
    significance: 50,
    eventType: "combat_victory",
    actors: [1],
    template: "{actor0} wins",
    variables: { actor0: "Hero" },
    rendered: "Hero wins",
  },
];

const TWO_ENTRIES: ChronicleEntry[] = [
  ...SINGLE_ENTRY,
  {
    entryId: "test-002",
    tick: 20,
    significance: 80,
    eventType: "legendary_deed",
    actors: [1],
    template: "{actor0} achieves greatness",
    variables: { actor0: "Hero" },
    rendered: "Hero achieves greatness",
  },
];

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("narrateChronicle", () => {
  it("is exported as a function", () => {
    expect(typeof narrateChronicle).toBe("function");
  });

  it("returns a Promise", () => {
    // We immediately catch to avoid unhandled rejection; we only care about the shape.
    const result = narrateChronicle(SINGLE_ENTRY, {}).catch(() => undefined);
    expect(result).toBeInstanceOf(Promise);
  });

  it("throws an error for empty entries array", async () => {
    await expect(narrateChronicle([], {})).rejects.toThrow(
      "entries array must not be empty",
    );
  });

  it("throws Not yet implemented when ANTHROPIC_API_KEY is absent", async () => {
    // Ensure the key is not set in this test process
    const saved = process.env["ANTHROPIC_API_KEY"];
    delete process.env["ANTHROPIC_API_KEY"];
    try {
      await expect(narrateChronicle(SINGLE_ENTRY, {})).rejects.toThrow(
        /ANTHROPIC_API_KEY|Not yet implemented/,
      );
    } finally {
      if (saved !== undefined) process.env["ANTHROPIC_API_KEY"] = saved;
    }
  });

  it("accepts all valid NarrateChronicleOptions fields without type error", () => {
    // This is a compile-time / shape test.  If the options type is wrong, TS will
    // fail to build this file.
    const options: NarrateChronicleOptions = {
      style: "mythological",
      maxWords: 500,
      model: "claude-3-5-haiku-20241022",
      linguisticIntelligenceQ: 12000,
    };
    expect(options.style).toBe("mythological");
    expect(options.maxWords).toBe(500);
  });

  it("accepts multiple entries and does not throw before API call", async () => {
    // With no API key, we still expect the API-key error (not an entries-parsing error)
    const saved = process.env["ANTHROPIC_API_KEY"];
    delete process.env["ANTHROPIC_API_KEY"];
    try {
      await expect(narrateChronicle(TWO_ENTRIES, { style: "epic" })).rejects.toThrow(
        /ANTHROPIC_API_KEY|Not yet implemented/,
      );
    } finally {
      if (saved !== undefined) process.env["ANTHROPIC_API_KEY"] = saved;
    }
  });
});
