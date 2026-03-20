import type {
  CampaignExport,
  CampaignMythEvent,
  FactionLanguageProfile,
  LanguageContext,
  LanguageRelationship,
  ProtoLanguageFamily,
} from "./types.js";

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[], fallback = 0): number {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("::");
}

function titleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

class DisjointSet {
  private readonly parent = new Map<string, string>();

  add(value: string): void {
    if (!this.parent.has(value)) this.parent.set(value, value);
  }

  find(value: string): string {
    const parent = this.parent.get(value);
    if (!parent) {
      this.parent.set(value, value);
      return value;
    }
    if (parent === value) return value;
    const root = this.find(parent);
    this.parent.set(value, root);
    return root;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) this.parent.set(rootA, rootB);
  }
}

export class LanguageContextBuilder {
  static build(campaign: CampaignExport): LanguageContext {
    const entityById = new Map(campaign.entities.map((entity) => [entity.id, entity]));
    const mythsByFaction = new Map<string, CampaignMythEvent[]>();
    for (const myth of campaign.mythEvents) {
      for (const factionId of myth.participantFactionIds) {
        const existing = mythsByFaction.get(factionId) ?? [];
        existing.push(myth);
        mythsByFaction.set(factionId, existing);
      }
    }

    const relationshipMap = new Map<string, LanguageRelationship>();
    const maxContactTicks = Math.max(1, ...campaign.contactPairs.map((pair) => pair.contactTicks));

    for (const pair of campaign.contactPairs) {
      const history = campaign.standingHistory.find(
        (entry) => pairKey(entry.factionAId, entry.factionBId) === pairKey(pair.factionAId, pair.factionBId),
      );
      const averageStanding = history ? average(history.samples.map((sample) => sample.standing), 0.5) : 0.5;
      const factionAMyths = mythsByFaction.get(pair.factionAId) ?? [];
      const factionBMyths = mythsByFaction.get(pair.factionBId) ?? [];
      const overlapThemes = new Set(
        factionAMyths
          .map((myth) => myth.theme)
          .filter((theme) => factionBMyths.some((candidate) => candidate.theme === theme)),
      );
      const mythOverlap = clamp(overlapThemes.size / Math.max(1, new Set([...factionAMyths.map((m) => m.theme), ...factionBMyths.map((m) => m.theme)]).size));
      const contactScore = clamp(pair.contactTicks / maxContactTicks);
      const conflictPenalty = clamp((pair.conflictTicks ?? 0) / Math.max(1, pair.contactTicks || 1));
      const driftScore = clamp(1 - contactScore * 0.55 - averageStanding * 0.25 - mythOverlap * 0.2 + conflictPenalty * 0.35);
      const loanWordIndex = clamp(contactScore * 0.6 + averageStanding * 0.2 + mythOverlap * 0.2 - conflictPenalty * 0.15);
      const relationLabel = averageStanding > 0.62 ? "allied" : averageStanding < 0.42 ? "hostile" : "neutral";

      relationshipMap.set(pairKey(pair.factionAId, pair.factionBId), {
        factionAId: pair.factionAId,
        factionBId: pair.factionBId,
        contactScore,
        standingTrend: averageStanding,
        mythOverlap,
        driftScore,
        loanWordIndex,
        relationLabel,
      });
    }

    const profiles: FactionLanguageProfile[] = campaign.factions.map((faction) => {
      const members = faction.memberEntityIds
        .map((entityId) => entityById.get(entityId))
        .filter((entity): entity is NonNullable<typeof entity> => entity !== undefined);
      const avgLinguistic = average(
        members.map((member) => member.attributes?.cognition?.linguistic ?? 0.5),
        0.5,
      );
      const factionRelationships = [...relationshipMap.values()].filter(
        (relationship) => relationship.factionAId === faction.id || relationship.factionBId === faction.id,
      );
      const contactIntensity = average(factionRelationships.map((relationship) => relationship.contactScore), 0);
      const isolationScore = clamp(1 - contactIntensity);
      const myths = mythsByFaction.get(faction.id) ?? [];
      const sharedMythThemes = [...new Set(
        myths
          .map((myth) => myth.theme)
          .filter((theme) => campaign.mythEvents.some((candidate) => candidate.theme === theme && !candidate.participantFactionIds.includes(faction.id))),
      )];
      const uniqueMythThemes = [...new Set(
        myths
          .map((myth) => myth.theme)
          .filter((theme) => !campaign.mythEvents.some((candidate) => candidate.theme === theme && candidate.participantFactionIds.some((id) => id !== faction.id))),
      )];
      const grammarComplexityScore = clamp(avgLinguistic * 0.55 + isolationScore * 0.3 + uniqueMythThemes.length * 0.08 - contactIntensity * 0.12) * 100;
      const likelyInfluences = factionRelationships
        .slice()
        .sort((left, right) => right.loanWordIndex - left.loanWordIndex)
        .slice(0, 3)
        .map((relationship) => (relationship.factionAId === faction.id ? relationship.factionBId : relationship.factionAId));

      return {
        factionId: faction.id,
        factionName: faction.name,
        averageLinguisticIntelligence: Number(avgLinguistic.toFixed(3)),
        memberCount: faction.memberEntityIds.length,
        contactIntensity: Number(contactIntensity.toFixed(3)),
        isolationScore: Number(isolationScore.toFixed(3)),
        grammarComplexityScore: Number(grammarComplexityScore.toFixed(1)),
        sharedMythThemes,
        uniqueMythThemes,
        likelyInfluences,
      };
    });

    const families = LanguageContextBuilder.buildFamilies(campaign, [...relationshipMap.values()]);
    const globalObservations = LanguageContextBuilder.buildObservations(profiles, [...relationshipMap.values()], campaign.mythEvents);

    return {
      campaignId: campaign.id,
      currentTick: campaign.currentTick,
      factionProfiles: profiles,
      relationships: [...relationshipMap.values()],
      protoLanguageFamilies: families,
      notableMyths: campaign.mythEvents.slice().sort((a, b) => b.tick - a.tick).slice(0, 8),
      globalObservations,
    };
  }

  private static buildFamilies(campaign: CampaignExport, relationships: LanguageRelationship[]): ProtoLanguageFamily[] {
    const set = new DisjointSet();
    for (const faction of campaign.factions) set.add(faction.id);

    for (const relationship of relationships) {
      if (relationship.contactScore >= 0.42 && relationship.standingTrend >= 0.45) {
        set.union(relationship.factionAId, relationship.factionBId);
      }
    }

    const grouped = new Map<string, string[]>();
    for (const faction of campaign.factions) {
      const root = set.find(faction.id);
      const existing = grouped.get(root) ?? [];
      existing.push(faction.id);
      grouped.set(root, existing);
    }

    return [...grouped.values()].map((memberFactionIds, index) => {
      const memberNames = memberFactionIds
        .map((factionId) => campaign.factions.find((faction) => faction.id === factionId)?.name ?? factionId)
        .map((name) => name.split(" ")[0])
        .slice(0, 2);
      const relationshipSubset = relationships.filter(
        (relationship) => memberFactionIds.includes(relationship.factionAId) && memberFactionIds.includes(relationship.factionBId),
      );
      const divergenceDepth = Math.max(1, Math.round(average(relationshipSubset.map((relationship) => relationship.driftScore), 0.5) * 5));
      const centralThemes = [...new Set(
        campaign.mythEvents
          .filter((myth) => myth.participantFactionIds.some((factionId) => memberFactionIds.includes(factionId)))
          .map((myth) => myth.theme),
      )].slice(0, 4);

      return {
        id: `proto_${index + 1}`,
        name: `Proto-${memberNames.join("-") || "Frontier"} Tongue`,
        memberFactionIds,
        divergenceDepth,
        centralThemes,
      };
    });
  }

  private static buildObservations(
    profiles: FactionLanguageProfile[],
    relationships: LanguageRelationship[],
    myths: CampaignMythEvent[],
  ): string[] {
    const mostComplex = profiles.slice().sort((a, b) => b.grammarComplexityScore - a.grammarComplexityScore)[0];
    const mostConnected = profiles.slice().sort((a, b) => b.contactIntensity - a.contactIntensity)[0];
    const highestLoanPair = relationships.slice().sort((a, b) => b.loanWordIndex - a.loanWordIndex)[0];
    const dominantThemes = [...new Set(myths.map((myth) => titleCase(myth.theme)))].slice(0, 5);

    const observations = [
      mostComplex
        ? `${mostComplex.factionName} should sound the most internally elaborate, with grammar complexity ${mostComplex.grammarComplexityScore}.`
        : undefined,
      mostConnected
        ? `${mostConnected.factionName} has the heaviest external contact, so its speech should show the strongest borrowing and register-mixing.`
        : undefined,
      highestLoanPair
        ? `${highestLoanPair.factionAId} and ${highestLoanPair.factionBId} are prime candidates for recognizable shared loanwords.`
        : undefined,
      dominantThemes.length > 0
        ? `Mythic language should repeatedly echo themes of ${dominantThemes.join(", ")}.`
        : undefined,
    ].filter((item): item is string => item !== undefined);

    return observations;
  }
}
