import { describe, it, expect } from "vitest"
import { buildSearchQueries, scoreSource, determineReliabilityTier, extractContentHash } from "./tavily"

describe("buildSearchQueries", () => {
  it("produces multiple targeted queries", () => {
    const queries = buildSearchQueries("United States", "UNSC", "Climate Migration")
    expect(queries.length).toBeGreaterThanOrEqual(5)
    expect(queries[0]).toContain("United States")
    expect(queries.some((q) => q.includes("resolutions"))).toBe(true)
  })

  it("adds focus-area queries when provided", () => {
    const queries = buildSearchQueries("Japan", "WHO", "Pandemic Preparedness", {
      depth: "standard",
      focusAreas: ["vaccine equity"],
    })
    expect(queries.some((q) => q.includes("vaccine equity"))).toBe(true)
  })

  it("adds extra historical queries for deep research", () => {
    const standard = buildSearchQueries("Brazil", "UNEP", "Deforestation")
    const deep = buildSearchQueries("Brazil", "UNEP", "Deforestation", { depth: "deep" })
    expect(deep.length).toBeGreaterThan(standard.length)
  })
})

describe("scoreSource", () => {
  const base = (url: string, title = "Title") => ({
    title,
    url,
    content: "",
    score: 0.5,
  })

  it("boosts UN domains", () => {
    const un = scoreSource(base("https://www.un.org/press/en"), "USA", "UNSC", "Ukraine Conflict")
    const other = scoreSource(base("https://randomsite.org/article"), "USA", "UNSC", "Ukraine Conflict")
    expect(un).toBeGreaterThan(other)
  })

  it("boosts relevance for country match in title", () => {
    const matched = scoreSource(base("https://news.example.com/x", "USA position on Ukraine Conflict"), "USA", "UNSC", "Ukraine Conflict")
    const unmatched = scoreSource(base("https://news.example.com/x", "Something else"), "USA", "UNSC", "Ukraine Conflict")
    expect(matched).toBeGreaterThan(unmatched)
  })

  it("caps the score at 1.0", () => {
    const score = scoreSource(base("https://www.un.org/gov/edu"), "un", "unsc", "u")
    expect(score).toBeLessThanOrEqual(1.0)
  })
})

describe("determineReliabilityTier", () => {
  it.each([
    ["https://www.un.org/en/", "UN"],
    ["https://undocs.org/A/RES/70/1", "UN"],
    ["https://www.state.gov/policy", "OFFICIAL"],
    ["https://www.who.int/news", "IO"],
    ["https://www.amnesty.org/report", "NGO"],
    ["https://harvard.edu/paper", "ACADEMIC"],
    ["https://www.reuters.com/world", "MEDIA"],
    ["https://unknown-blog.xyz/post", "OTHER"],
  ])("maps %s to %s", (url, expected) => {
    expect(determineReliabilityTier(url)).toBe(expected)
  })
})

describe("extractContentHash", () => {
  it("is deterministic", () => {
    expect(extractContentHash("same content")).toBe(extractContentHash("same content"))
  })

  it("differs for different content", () => {
    expect(extractContentHash("content a")).not.toBe(extractContentHash("content b"))
  })
})