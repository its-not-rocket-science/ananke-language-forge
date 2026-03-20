export interface CampaignFaction {
  id: string;
  name: string;
  memberEntityIds: number[];
  tags?: string[] | undefined;
}

export interface CampaignEntity {
  id: number;
  name: string;
  factionId?: string | undefined;
  attributes?: {
    cognition?: {
      linguistic?: number | undefined;
    };
  };
}

export interface CampaignContactPair {
  factionAId: string;
  factionBId: string;
  contactTicks: number;
  sharedBorder?: number | undefined;
  tradeTicks?: number | undefined;
  conflictTicks?: number | undefined;
}

export interface CampaignStandingHistory {
  factionAId: string;
  factionBId: string;
  samples: Array<{
    tick: number;
    standing: number;
  }>;
}

export interface CampaignMythEvent {
  id: string;
  theme: string;
  summary: string;
  tick: number;
  participantFactionIds: string[];
}

export interface CampaignExport {
  id: string;
  worldSeed?: number | undefined;
  currentTick: number;
  factions: CampaignFaction[];
  entities: CampaignEntity[];
  contactPairs: CampaignContactPair[];
  standingHistory: CampaignStandingHistory[];
  mythEvents: CampaignMythEvent[];
}

export interface FactionLanguageProfile {
  factionId: string;
  factionName: string;
  averageLinguisticIntelligence: number;
  memberCount: number;
  contactIntensity: number;
  isolationScore: number;
  grammarComplexityScore: number;
  sharedMythThemes: string[];
  uniqueMythThemes: string[];
  likelyInfluences: string[];
}

export interface LanguageRelationship {
  factionAId: string;
  factionBId: string;
  contactScore: number;
  standingTrend: number;
  mythOverlap: number;
  driftScore: number;
  loanWordIndex: number;
  relationLabel: "allied" | "neutral" | "hostile";
}

export interface ProtoLanguageFamily {
  id: string;
  name: string;
  memberFactionIds: string[];
  divergenceDepth: number;
  centralThemes: string[];
}

export interface LanguageContext {
  campaignId: string;
  currentTick: number;
  factionProfiles: FactionLanguageProfile[];
  relationships: LanguageRelationship[];
  protoLanguageFamilies: ProtoLanguageFamily[];
  notableMyths: CampaignMythEvent[];
  globalObservations: string[];
}

export interface GeneratedVocabularyItem {
  word: string;
  meaning: string;
  etymology: string;
  usageNote?: string | undefined;
}

export interface GeneratedFactionLanguage {
  factionId: string;
  factionName: string;
  greeting: string;
  phonologyProfile: string[];
  grammarNotes: string[];
  oralTraditionExcerpt: string;
  vocabulary: GeneratedVocabularyItem[];
}

export interface LanguagePackage {
  campaignId: string;
  generatedAt: string;
  languageFamilyTree: {
    protoLanguages: ProtoLanguageFamily[];
  };
  factionVocabulary: GeneratedFactionLanguage[];
  grammarComplexityScores: Record<string, number>;
  loanWordContaminationIndex: Record<string, number>;
  promptMetadata: {
    provider: string;
    model: string;
  };
}

export interface ForgeRequest {
  prompt: string;
  systemPrompt: string;
  responseFormat?: "json" | "text" | undefined;
}

export interface ForgeResponse {
  text: string;
  provider: string;
  model: string;
}
