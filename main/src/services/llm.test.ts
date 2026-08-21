import { describe, it, expect } from "vitest"
import { getModelForTask } from "./llm"
import {
  generateResearchRequestSchema,
  researchConfigSchema,
  citationSchema,
} from "@/types/shared"

describe("getModelForTask", () => {
  it("returns the preferred model when available for the tier", () => {
    expect(getModelForTask("report_generation", "plus")).toBe("gemini-2.0-flash")
    expect(getModelForTask("chat", "free")).toBe("gemini-2.0-flash")
  })

  it("falls back to the first model in the tier chain", () => {
    // free tier only has gemini; any task maps to it
    const model = getModelForTask("citation_validation", "free")
    expect(["gemini-2.0-flash"]).toContain(model)
  })

  it("never returns a model outside the user's tier chain", () => {
    const allowed = new Set(["gemini-2.0-flash"] as const)
    const model = getModelForTask("report_generation", "free")
    expect(allowed.has(model as "gemini-2.0-flash")).toBe(true)
  })
})

describe("shared zod schemas", () => {
  it("accepts a valid research request", () => {
    const parsed = generateResearchRequestSchema.safeParse({
      countryId: "us",
      committeeId: "unsc",
      agendaId: "climate",
    })
    expect(parsed.success).toBe(true)
  })

  it("rejects a research request missing fields", () => {
    const parsed = generateResearchRequestSchema.safeParse({ countryId: "us" })
    expect(parsed.success).toBe(false)
  })

  it("applies config defaults", () => {
    const parsed = researchConfigSchema.parse({})
    expect(parsed.depth).toBe("standard")
    expect(parsed.focusAreas).toEqual([])
    expect(parsed.includeStatistics).toBe(true)
  })

  it("validates citation status enum", () => {
    expect(
      citationSchema.safeParse({
        id: "c1",
        claim: "claim",
        sourceId: "s1",
        sourceTier: "UN",
        status: "VALID",
        evidenceExcerpt: null,
      }).success
    ).toBe(true)

    expect(
      citationSchema.safeParse({
        id: "c1",
        claim: "claim",
        sourceId: "s1",
        sourceTier: "UN",
        status: "MADE_UP_STATUS",
        evidenceExcerpt: null,
      }).success
    ).toBe(false)
  })
})