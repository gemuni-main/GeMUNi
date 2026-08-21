import { Citation, Source, ReliabilityTier } from "@/types/shared"

export interface ValidationResult {
  citationId: string
  status: "VALID" | "INVALID" | "PARTIAL" | "UNCERTAIN"
  confidence: number
  evidenceExcerpt: string | null
  reasoning: string
}

export interface ValidationConfig {
  minConfidenceThreshold: number
  requireExactMatch: boolean
  allowParaphrase: boolean
  maxExcerptLength: number
}

const DEFAULT_CONFIG: ValidationConfig = {
  minConfidenceThreshold: 0.7,
  requireExactMatch: false,
  allowParaphrase: true,
  maxExcerptLength: 500,
}

function extractKeyClaims(claim: string): string[] {
  return claim
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
}

function findRelevantExcerpt(sourceText: string, claim: string, maxLength: number): string | null {
  const claimWords = claim.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  const sentences = sourceText.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 10)

  let bestMatch = ""
  let bestScore = 0

  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase()
    let score = 0

    for (const word of claimWords) {
      if (sentenceLower.includes(word)) {
        score++
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = sentence
    }
  }

  if (bestScore >= 2 && bestMatch) {
    return bestMatch.length > maxLength ? bestMatch.substring(0, maxLength) + "…" : bestMatch
  }

  return null
}

function calculateConfidence(claim: string, excerpt: string | null, tier: ReliabilityTier): number {
  if (!excerpt) return 0

  const claimWords = claim.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  const excerptWords = excerpt.toLowerCase().split(/\s+/).filter((w) => w.length > 3)

  let matches = 0
  for (const word of claimWords) {
    if (excerptWords.includes(word)) {
      matches++
    }
  }

  const wordOverlap = claimWords.length > 0 ? matches / claimWords.length : 0

  const tierBonus: Record<ReliabilityTier, number> = {
    UN: 0.3,
    OFFICIAL: 0.25,
    IO: 0.2,
    NGO: 0.15,
    ACADEMIC: 0.15,
    MEDIA: 0.1,
    OTHER: 0.05,
  }

  const baseConfidence = Math.min(wordOverlap * 2, 0.8)
  const tierAdjustment = tierBonus[tier] || 0

  return Math.min(baseConfidence + tierAdjustment, 1.0)
}

export async function validateCitation(
  citation: Citation,
  source: Source,
  sourceText: string,
  config: ValidationConfig = DEFAULT_CONFIG
): Promise<ValidationResult> {
  const excerpt = findRelevantExcerpt(sourceText, citation.claim, config.maxExcerptLength)
  const confidence = calculateConfidence(citation.claim, excerpt, source.tier)

  let status: "VALID" | "INVALID" | "PARTIAL" | "UNCERTAIN" = "UNCERTAIN"
  let reasoning = ""

  if (!excerpt) {
    status = "INVALID"
    reasoning = "No relevant excerpt found in source to support the claim."
  } else if (confidence >= config.minConfidenceThreshold) {
    status = "VALID"
    reasoning = `Claim supported by source excerpt with ${(confidence * 100).toFixed(0)}% confidence.`
  } else if (confidence >= config.minConfidenceThreshold * 0.5) {
    status = "PARTIAL"
    reasoning = `Claim partially supported by source excerpt with ${(confidence * 100).toFixed(0)}% confidence.`
  } else {
    status = "INVALID"
    reasoning = `Insufficient evidence in source to support claim (${(confidence * 100).toFixed(0)}% confidence).`
  }

  return {
    citationId: citation.id,
    status,
    confidence,
    evidenceExcerpt: excerpt,
    reasoning,
  }
}

export async function validateAllCitations(
  citations: Citation[],
  sources: Map<string, Source>,
  sourceTexts: Map<string, string>,
  config: ValidationConfig = DEFAULT_CONFIG
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  for (const citation of citations) {
    const source = sources.get(citation.sourceId)
    const sourceText = sourceTexts.get(citation.sourceId)

    if (!source || !sourceText) {
      results.push({
        citationId: citation.id,
        status: "INVALID",
        confidence: 0,
        evidenceExcerpt: null,
        reasoning: "Source not found or source text unavailable.",
      })
      continue
    }

    const result = await validateCitation(citation, source, sourceText, config)
    results.push(result)
  }

  return results
}

export function filterValidCitations(
  results: ValidationResult[],
  citations: Citation[]
): Citation[] {
  const validIds = new Set(
    results
      .filter((r) => r.status === "VALID" || r.status === "PARTIAL")
      .map((r) => r.citationId)
  )

  return citations.filter((c) => validIds.has(c.id))
}

export function generateValidationReport(results: ValidationResult[]): {
  total: number
  valid: number
  partial: number
  invalid: number
  uncertain: number
  averageConfidence: number
} {
  const total = results.length
  const valid = results.filter((r) => r.status === "VALID").length
  const partial = results.filter((r) => r.status === "PARTIAL").length
  const invalid = results.filter((r) => r.status === "INVALID").length
  const uncertain = results.filter((r) => r.status === "UNCERTAIN").length
  const averageConfidence =
    total > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / total : 0

  return { total, valid, partial, invalid, uncertain, averageConfidence }
}