import { readFile } from "node:fs/promises";
import type {
  CampaignContactPair,
  CampaignEntity,
  CampaignExport,
  CampaignFaction,
  CampaignMythEvent,
  CampaignStandingHistory,
} from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asNumberArray(value: unknown): number[] {
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [];
}

function normalizeFaction(input: unknown): CampaignFaction | null {
  if (!isRecord(input)) return null;

  const id = asString(input.id);
  const name = asString(input.name, id);
  if (!id) return null;

  const memberEntityIds = asNumberArray(input.memberEntityIds ?? input.memberIds);
  const tags = asStringArray(input.tags);

  return { id, name, memberEntityIds, tags: tags.length > 0 ? tags : undefined };
}

function normalizeEntity(input: unknown): CampaignEntity | null {
  if (!isRecord(input)) return null;
  const id = asNumber(input.id, Number.NaN);
  if (!Number.isFinite(id)) return null;

  const cognition = isRecord(input.attributes) && isRecord(input.attributes.cognition)
    ? { linguistic: asNumber(input.attributes.cognition.linguistic, 0) }
    : undefined;

  const entity: CampaignEntity = {
    id,
    name: asString(input.name, `Entity ${id}`),
  };

  const factionId = asString(input.factionId);
  if (factionId) entity.factionId = factionId;
  if (cognition) entity.attributes = { cognition };

  return entity;
}

function normalizeContactPair(input: unknown): CampaignContactPair | null {
  if (!isRecord(input)) return null;
  const factionAId = asString(input.factionAId ?? input.a);
  const factionBId = asString(input.factionBId ?? input.b);
  if (!factionAId || !factionBId) return null;

  return {
    factionAId,
    factionBId,
    contactTicks: asNumber(input.contactTicks, 0),
    sharedBorder: asNumber(input.sharedBorder, 0),
    tradeTicks: asNumber(input.tradeTicks, 0),
    conflictTicks: asNumber(input.conflictTicks, 0),
  };
}

function normalizeStandingHistory(input: unknown): CampaignStandingHistory | null {
  if (!isRecord(input)) return null;
  const factionAId = asString(input.factionAId ?? input.a);
  const factionBId = asString(input.factionBId ?? input.b);
  if (!factionAId || !factionBId) return null;

  const rawSamples = Array.isArray(input.samples) ? input.samples : [];
  const samples = rawSamples
    .filter(isRecord)
    .map((sample) => ({ tick: asNumber(sample.tick, 0), standing: asNumber(sample.standing, 0.5) }));

  return { factionAId, factionBId, samples };
}

function normalizeMythEvent(input: unknown): CampaignMythEvent | null {
  if (!isRecord(input)) return null;
  const id = asString(input.id);
  if (!id) return null;

  return {
    id,
    theme: asString(input.theme, "legacy"),
    summary: asString(input.summary, "An unnamed story lingers in memory."),
    tick: asNumber(input.tick, 0),
    participantFactionIds: asStringArray(input.participantFactionIds ?? input.factionIds),
  };
}

export class CampaignReader {
  static async fromFile(path: string): Promise<CampaignExport> {
    const raw = await readFile(path, "utf8");
    return CampaignReader.fromJson(raw);
  }

  static fromJson(json: string): CampaignExport {
    const parsed: unknown = JSON.parse(json);
    return CampaignReader.fromUnknown(parsed);
  }

  static fromUnknown(input: unknown): CampaignExport {
    if (!isRecord(input)) {
      throw new Error("CampaignReader: campaign export must be a JSON object");
    }

    const factions = Array.isArray(input.factions) ? input.factions.map(normalizeFaction).filter((item): item is CampaignFaction => item !== null) : [];
    const entities = Array.isArray(input.entities) ? input.entities.map(normalizeEntity).filter((item): item is CampaignEntity => item !== null) : [];
    const contactPairs = Array.isArray(input.contactPairs)
      ? input.contactPairs.map(normalizeContactPair).filter((item): item is CampaignContactPair => item !== null)
      : [];
    const standingHistory = Array.isArray(input.standingHistory)
      ? input.standingHistory.map(normalizeStandingHistory).filter((item): item is CampaignStandingHistory => item !== null)
      : [];
    const mythEvents = Array.isArray(input.mythEvents)
      ? input.mythEvents.map(normalizeMythEvent).filter((item): item is CampaignMythEvent => item !== null)
      : [];

    if (factions.length === 0) {
      throw new Error("CampaignReader: campaign export must include at least one faction");
    }

    return {
      id: asString(input.id, "campaign"),
      worldSeed: asNumber(input.worldSeed, 0),
      currentTick: asNumber(input.currentTick, 0),
      factions,
      entities,
      contactPairs,
      standingHistory,
      mythEvents,
    };
  }
}
