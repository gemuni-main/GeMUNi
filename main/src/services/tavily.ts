import { ReliabilityTier, Source } from "@/types/shared"
import { env } from "@/lib/env"

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  raw_content?: string
}

interface TavilyResponse {
  query: string
  results: TavilySearchResult[]
  response_time: number
}

const TAVILY_API_KEY = env.research.tavilyApiKey
const TAVILY_API_URL = "https://api.tavily.com/search"

export async function tavilySearch(
  query: string,
  options: {
    maxResults?: number
    searchDepth?: "basic" | "advanced"
    includeDomains?: string[]
    excludeDomains?: string[]
  } = {}
): Promise<TavilySearchResult[]> {
  const {
    maxResults = 10,
    searchDepth = "advanced",
    includeDomains,
    excludeDomains,
  } = options

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: searchDepth,
        include_domains: includeDomains,
        exclude_domains: excludeDomains,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`)
    }

    const data: TavilyResponse = await response.json()
    return data.results
  } catch (error) {
    console.error("Tavily search failed:", error)
    return getMockResults(query)
  }
}

function getMockResults(query: string): TavilySearchResult[] {
  return [
    {
      title: `Mock result for: ${query}`,
      url: "https://example.com/mock-1",
      content: `This is a mock search result for the query: ${query}. In production, this would be real content from Tavily.`,
      score: 0.95,
    },
    {
      title: `Another mock result: ${query}`,
      url: "https://example.com/mock-2",
      content: `Additional mock content for ${query} with more details and context.`,
      score: 0.87,
    },
  ]
}

export function buildSearchQueries(
  country: string,
  committee: string,
  agenda: string,
  config?: {
    depth?: string
    focusAreas?: string[]
  }
): string[] {
  const queries = [
    `${country} position on ${agenda} ${committee}`,
    `${committee} ${agenda} resolutions`,
    `${country} foreign policy ${agenda}`,
    `${agenda} international law United Nations`,
    `${country} diplomatic stance ${agenda}`,
  ]

  if (config?.focusAreas?.length) {
    config.focusAreas.forEach((area) => {
      queries.push(`${country} ${area} ${agenda}`)
    })
  }

  if (config?.depth === "deep") {
    queries.push(
      `${agenda} historical background UN`,
      `${country} voting record ${agenda}`,
      `${committee} previous sessions ${agenda}`,
      `${agenda} NGO reports ${country}`,
      `${agenda} academic analysis`
    )
  }

  return queries
}

export function scoreSource(
  source: TavilySearchResult,
  country: string,
  committee: string,
  agenda: string
): number {
  let score = source.score || 0

  const url = source.url.toLowerCase()
  const title = source.title.toLowerCase()

  if (url.includes(".un.org") || url.includes("undocs.org")) {
    score += 0.3
  }
  if (url.includes(".gov") || url.includes(".gov.")) {
    score += 0.25
  }
  if (url.includes("who.int") || url.includes("unep.org") || url.includes("unicef.org")) {
    score += 0.2
  }
  if (url.includes(".edu") || url.includes("scholar.google") || url.includes("jstor")) {
    score += 0.15
  }

  const countryLower = country.toLowerCase()
  if (title.includes(countryLower) || url.includes(countryLower)) {
    score += 0.1
  }

  const committeeLower = committee.toLowerCase()
  if (title.includes(committeeLower) || url.includes(committeeLower)) {
    score += 0.1
  }

  return Math.min(score, 1.0)
}

export function determineReliabilityTier(url: string, publisher?: string): ReliabilityTier {
  const urlLower = url.toLowerCase()

  if (urlLower.includes(".un.org") || urlLower.includes("undocs.org")) {
    return "UN"
  }
  if (urlLower.includes(".gov") || urlLower.includes(".gov.")) {
    return "OFFICIAL"
  }
  if (
    urlLower.includes("who.int") ||
    urlLower.includes("unep.org") ||
    urlLower.includes("unicef.org") ||
    urlLower.includes("unesco.org") ||
    urlLower.includes("fao.org")
  ) {
    return "IO"
  }
  if (
    urlLower.includes("amnesty.org") ||
    urlLower.includes("hrw.org") ||
    urlLower.includes("oxfam.org") ||
    urlLower.includes("crisisgroup.org")
  ) {
    return "NGO"
  }
  if (
    urlLower.includes(".edu") ||
    urlLower.includes("scholar.google") ||
    urlLower.includes("jstor.org") ||
    urlLower.includes("sciencedirect.com") ||
    urlLower.includes("springer.com")
  ) {
    return "ACADEMIC"
  }
  if (
    urlLower.includes("reuters.com") ||
    urlLower.includes("apnews.com") ||
    urlLower.includes("bbc.com") ||
    urlLower.includes("nytimes.com") ||
    urlLower.includes("washingtonpost.com") ||
    urlLower.includes("theguardian.com")
  ) {
    return "MEDIA"
  }

  return "OTHER"
}

export function extractContentHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}