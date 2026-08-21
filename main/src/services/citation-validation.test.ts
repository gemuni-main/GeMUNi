import { describe, it, expect } from "vitest"
import {
  validateCitation,
  filterValidCitations,
  generateValidationReport,
} from "./citation-validation"
import type { Citation, Source } from "@/types/shared"

const makeSource = (overrides: Partial<Source> = {}): Source => ({
  id: "src_1",
  title: "UN Resolution Report",
  url: "https://www.un.org/press",
  publisher: "United Nations",
  tier: "UN",
  retrievedAt: new Date(),
  contentHash: "abc",
  relevanceScore: 0.9,
  ...overrides,
})

const makeCitation = (overrides: Partial<Citation> = {}): Citation => ({
  id: "cite_1",
  reportId: "report_1",
  claim: "The Security Council has repeatedly addressed the conflict through resolutions",
  sourceId: "src_1",
  sourceTier: "UN",
  status: "UNCERTAIN",
  evidenceExcerpt: null,
  createdAt: new Date(),
  ...overrides,
})

const sourceText =
  "The Security Council has repeatedly addressed the conflict through resolutions and presidential statements since 2014. " +
  "Humanitarian access remains a central concern for member states. " +
  "General Assembly votes on the matter have shown broad international support."

describe("validateCitation", () => {
  it("marks supported claims as VALID with an excerpt", async () => {
    const result = await validateCitation(makeCitation(), makeSource(), sourceText)
    expect(result.status).toBe("VALID")
    expect(result.evidenceExcerpt).toBeTruthy()
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  it("marks unsupported claims as INVALID", async () => {
    const citation = makeCitation({ claim: "The moon is made of green cheese according to the UN" })
    const result = await validateCitation(citation, makeSource(), sourceText)
    expect(result.status).toBe("INVALID")
    expect(result.evidenceExcerpt).toBeNull()
  })

  it("returns INVALID when no relevant excerpt exists", async () => {
    const result = await validateCitation(
      makeCitation({ claim: "Completely unrelated claim about quantum physics and bananas" }),
      makeSource(),
      sourceText
    )
    expect(result.status).toBe("INVALID")
  })

  it("gives higher confidence to higher-tier sources", async () => {
    const unResult = await validateCitation(makeCitation(), makeSource({ tier: "UN" }), sourceText)
    const otherResult = await validateCitation(
      makeCitation(),
      makeSource({ tier: "OTHER" }),
      sourceText
    )
    expect(unResult.confidence).toBeGreaterThanOrEqual(otherResult.confidence)
  })
})

describe("filterValidCitations", () => {
  it("keeps only citations whose validation passed", () => {
    const good = makeCitation({ id: "good" })
    const bad = makeCitation({
      id: "bad",
      claim: "Totally unrelated gibberish about zeppelins and marmalade sandwiches forever",
    })

    const results = [
      { citationId: "good", status: "VALID" as const, confidence: 0.9, evidenceExcerpt: null, reasoning: "" },
      { citationId: "bad", status: "INVALID" as const, confidence: 0.1, evidenceExcerpt: null, reasoning: "" },
    ]

    const filtered = filterValidCitations(results, [good, bad])
    expect(filtered.map((c) => c.id)).toEqual(["good"])
  })
})

describe("generateValidationReport", () => {
  it("summarizes statuses correctly", () => {
    const results = [
      { citationId: "1", status: "VALID" as const, confidence: 0.9, evidenceExcerpt: null, reasoning: "" },
      { citationId: "2", status: "PARTIAL" as const, confidence: 0.5, evidenceExcerpt: null, reasoning: "" },
      { citationId: "3", status: "INVALID" as const, confidence: 0.1, evidenceExcerpt: null, reasoning: "" },
      { citationId: "4", status: "VALID" as const, confidence: 0.8, evidenceExcerpt: null, reasoning: "" },
    ]
    const report = generateValidationReport(results)
    expect(report.total).toBe(4)
    expect(report.valid).toBe(2)
    expect(report.partial).toBe(1)
    expect(report.invalid).toBe(1)
    expect(report.averageConfidence).toBeCloseTo((0.9 + 0.5 + 0.1 + 0.8) / 4)
  })
})