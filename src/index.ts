// src/index.ts — ananke-language-forge public API
//
// Re-exports all forge functions.  Import from this module in host projects:
//   import { narrateChronicle, composeMythText, generateDialogue } from "@its-not-rocket-science/ananke-language-forge";

export { narrateChronicle, type NarrateChronicleOptions } from "./chronicle-narrator.js";
export { composeMythText, type MythComposeOptions } from "./myth-composer.js";
export { generateDialogue, type DialogueOptions } from "./dialogue-generator.js";
