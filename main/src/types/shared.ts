import { z } from "zod";

// ============ Catalog Types ============

export type CatalogCountry = {
  id: string
  name: string
  isoCode: string
  flagEmoji: string
}

export type CatalogCommittee = {
  id: string
  name: string
  acronym: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

export type CatalogAgenda = {
  id: string
  title: string
  description: string
  committeeId: string
  compatibility: string[]
}

// ============ Report & Research Types ============

export type ReportStatus = "draft" | "processing" | "completed" | "failed"

export type ResearchStatus =
  | "queued"
  | "running"
  | "partially_completed"
  | "completed"
  | "failed"
  | "cancelled"

export type ReliabilityTier =
  | "UN"
  | "OFFICIAL"
  | "IO"
  | "NGO"
  | "ACADEMIC"
  | "MEDIA"
  | "OTHER"

export type TaskCapability =
  | "research_planning"
  | "summarization"
  | "report_generation"
  | "citation_validation"
  | "chat"

export type ModelId = "gemini-2.0-flash" | "kimi-k2" | "openrouter"

export interface Report {
  id: string
  userId: string
  countryId: string
  committeeId: string
  agendaId: string
  status: ReportStatus
  title: string
  sections: ReportSection[]
  citationCount: number
  sourceCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ReportSection {
  id: string
  title: string
  content: string
  order: number
}

export interface GenerateResearchRequest {
  countryId: string
  committeeId: string
  agendaId: string
  config?: ResearchConfig
}

export interface ResearchConfig {
  depth: "brief" | "standard" | "deep"
  focusAreas: string[]
  includeHistoricalContext: boolean
  includeCurrentDevelopments: boolean
  includeDiplomaticPosition: boolean
  includeStatistics: boolean
  includeProposedSolutions: boolean
  includePolicyOptions: boolean
}

export interface ResearchItemDTO {
  id: string
  country: CatalogCountry
  committee: CatalogCommittee
  agenda: CatalogAgenda
  status: ResearchStatus
  createdAt: Date
  updatedAt: Date
  sourceCount: number
  report?: Report | null
}

export interface ProjectDTO {
  id: string
  userId: string
  name: string
  reportId?: string | null
  createdAt: Date
  updatedAt: Date
  researchCount: number
}

// ============ Source & Citation Types ============

export interface Source {
  id: string
  title: string
  url: string
  publisher: string
  tier: ReliabilityTier
  retrievedAt: Date
  contentHash: string
  relevanceScore: number
}

export interface SourceChunk {
  id: string
  sourceId: string
  chunkIndex: number
  text: string
  tokenEstimate: number
  title: string
  url: string
  publisher: string
  reliabilityTier: ReliabilityTier
}

export interface Citation {
  id: string
  reportId: string
  claim: string
  sourceId: string
  sourceTier: ReliabilityTier
  status: "VALID" | "INVALID" | "PARTIAL" | "UNCERTAIN"
  evidenceExcerpt: string | null
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations: string[] // source IDs
  createdAt: Date
}

export interface UsageRecord {
  id: string
  userId: string
  researchId?: string | null
  model: ModelId
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
  timestamp: Date
}

// ============ Inngest Event Types ============

export type InngestEvent =
  | "research/started"
  | "research/progress"
  | "research/completed"
  | "research/failed"

// ============ Zod Schemas ============

export const catalogCountrySchema = z.object({
  id: z.string(),
  name: z.string(),
  isoCode: z.string(),
  flagEmoji: z.string(),
})

export const catalogCommitteeSchema = z.object({
  id: z.string(),
  name: z.string(),
  acronym: z.string(),
  description: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
})

export const catalogAgendaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  committeeId: z.string(),
  compatibility: z.array(z.string()).default([]),
})

export const researchConfigSchema = z.object({
  depth: z.enum(["brief", "standard", "deep"]).default("standard"),
  focusAreas: z.array(z.string()).default([]),
  includeHistoricalContext: z.boolean().default(true),
  includeCurrentDevelopments: z.boolean().default(true),
  includeDiplomaticPosition: z.boolean().default(true),
  includeStatistics: z.boolean().default(true),
  includeProposedSolutions: z.boolean().default(true),
  includePolicyOptions: z.boolean().default(true),
})

export const generateResearchRequestSchema = z.object({
  countryId: z.string(),
  committeeId: z.string(),
  agendaId: z.string(),
  config: researchConfigSchema.optional(),
})

export const reportSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  order: z.number(),
})

export const citationSchema = z.object({
  id: z.string(),
  claim: z.string(),
  sourceId: z.string(),
  sourceTier: z.enum(["UN", "OFFICIAL", "IO", "NGO", "ACADEMIC", "MEDIA", "OTHER"]),
  status: z.enum(["VALID", "INVALID", "PARTIAL", "UNCERTAIN"]),
  evidenceExcerpt: z.string().nullable(),
})

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  citations: z.array(z.string()).default([]),
})