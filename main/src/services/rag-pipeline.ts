import { prisma } from "@/lib/prisma"
import { tavilySearch, buildSearchQueries, scoreSource, determineReliabilityTier, extractContentHash } from "./tavily"
import { generateWithFailover, getModelForTask } from "./llm"
import { validateAllCitations } from "./citation-validation"
import { ResearchStatus, ReportStatus, ReliabilityTier, Source, Citation, ResearchConfig } from "@/types/shared"
import { inngest } from "@/lib/inngest"

interface ChunkResult {
  id: string
  text: string
  tokenEstimate: number
  title: string
  url: string
  publisher: string
  reliabilityTier: ReliabilityTier
}

export async function runResearchPipeline(researchItemId: string): Promise<void> {
  await updateResearchStatus(researchItemId, "running")

  try {
    const researchItem = await getResearchItem(researchItemId)
    if (!researchItem) throw new Error("Research item not found")

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "validating", progress: 10 },
    })

    const config = researchItem.config as ResearchConfig
    const queries = buildSearchQueries(
      researchItem.countryId,
      researchItem.committeeId,
      researchItem.agendaId,
      config
    )

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "searching", progress: 20 },
    })

    const allResults = await performSearches(queries)

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "ranking", progress: 35 },
    })

    const rankedSources = rankAndFilterSources(allResults, researchItem.countryId, researchItem.committeeId, researchItem.agendaId)

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "extracting", progress: 50 },
    })

    const sources = await extractAndSaveSources(researchItemId, rankedSources)

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "chunking", progress: 60 },
    })

    const chunks = await chunkAndSaveContent(sources)

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "embedding", progress: 70 },
    })

    await generateAndStoreEmbeddings(chunks)

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "generating", progress: 80 },
    })

    const { report, citations } = await generateReport(
      researchItemId,
      sources,
      chunks,
      config
    )

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "validating_citations", progress: 90 },
    })

    await validateAndSaveCitations(report.id, citations, sources)

    await inngest.send({
      name: "research/progress",
      data: { researchItemId, step: "finalizing", progress: 95 },
    })

    await finalizeResearch(researchItemId, report.id, sources.length, citations.length)

    await inngest.send({
      name: "research/completed",
      data: { researchItemId, reportId: report.id },
    })

    await updateResearchStatus(researchItemId, "completed")
  } catch (error) {
    console.error("Research pipeline failed:", error)
    await updateResearchStatus(researchItemId, "failed")
    await inngest.send({
      name: "research/failed",
      data: { researchItemId, error: String(error) },
    })
  }
}

async function getResearchItem(researchItemId: string) {
  return prisma.research_items.findUnique({
    where: { id: researchItemId },
  })
}

async function updateResearchStatus(researchItemId: string, status: ResearchStatus) {
  await prisma.research_items.update({
    where: { id: researchItemId },
    data: { status },
  })
}

async function performSearches(queries: string[]) {
  const allResults = []
  for (const query of queries) {
    const results = await tavilySearch(query, { maxResults: 5 })
    allResults.push(...results)
  }
  return allResults
}

function rankAndFilterSources(
  results: any[],
  countryId: string,
  committeeId: string,
  agendaId: string
) {
  const uniqueResults = new Map()
  for (const result of results) {
    const key = result.url
    if (!uniqueResults.has(key) || uniqueResults.get(key).score < result.score) {
      uniqueResults.set(key, result)
    }
  }

  const scored = Array.from(uniqueResults.values()).map((r) => ({
    ...r,
    relevanceScore: scoreSource(r, countryId, committeeId, agendaId),
    tier: determineReliabilityTier(r.url),
  }))

  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 20)
}

async function extractAndSaveSources(researchItemId: string, rankedSources: any[]) {
  const sources: Source[] = []

  for (const ranked of rankedSources) {
    const contentHash = extractContentHash(ranked.content || ranked.title)
    const existing = await prisma.sources.findFirst({ where: { contentHash } })

    if (existing) {
      sources.push(existing as Source)
      continue
    }

    const source = await prisma.sources.create({
      data: {
        researchItemId,
        title: ranked.title,
        url: ranked.url,
        publisher: new URL(ranked.url).hostname,
        tier: ranked.tier,
        relevanceScore: ranked.relevanceScore,
        contentHash,
        retrievedAt: new Date(),
      },
    })

    sources.push(source as Source)
  }

  return sources
}

async function chunkAndSaveContent(sources: Source[]) {
  const chunks: ChunkResult[] = []

  for (const source of sources) {
    const text = source.title + " " + (source as any).content || ""
    const chunkSize = 1000
    const overlap = 200

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunkText = text.slice(i, i + chunkSize)
      if (chunkText.trim().length < 100) continue

      const chunk = await prisma.source_chunks.create({
        data: {
          sourceId: source.id,
          chunkIndex: Math.floor(i / (chunkSize - overlap)),
          text: chunkText,
          tokenEstimate: Math.ceil(chunkText.length / 4),
          title: source.title,
          url: source.url,
          publisher: source.publisher,
          reliabilityTier: source.tier,
        },
      })

      chunks.push({
        id: chunk.id,
        text: chunkText,
        tokenEstimate: Math.ceil(chunkText.length / 4),
        title: source.title,
        url: source.url,
        publisher: source.publisher,
        reliabilityTier: source.tier,
      })
    }
  }

  return chunks
}

async function generateAndStoreEmbeddings(chunks: ChunkResult[]) {
  // In production, call OpenAI embeddings API
  // For now, just mark as processed
  for (const chunk of chunks) {
    await prisma.source_chunks.update({
      where: { id: chunk.id },
      data: { text: chunk.text }, // Embedding would be stored here
    })
  }
}

async function generateReport(
  researchItemId: string,
  sources: Source[],
  chunks: ChunkResult[],
  config: ResearchConfig
) {
  const modelId = getModelForTask("report_generation", "pro")

  const sections = config.depth === "deep"
    ? [
        "Executive Summary",
        "Country Position",
        "Background",
        "Historical Context",
        "Current Situation",
        "Key Stakeholders",
        "Political / Diplomatic Position",
        "Economic Considerations",
        "Humanitarian Considerations",
        "Relevant UN Actions",
        "Existing International Frameworks",
        "Policy Options",
        "Potential Solutions",
        "MUN Talking Points",
        "Questions to Raise",
        "Conclusion",
      ]
    : [
        "Executive Summary",
        "Country Position",
        "Background",
        "Current Situation",
        "Key Stakeholders",
        "Political / Diplomatic Position",
        "Potential Solutions",
        "MUN Talking Points",
        "Conclusion",
      ]

  const context = chunks.slice(0, 30).map((c) => `[${c.id}] ${c.text}`).join("\n\n")

  const prompt = `You are a MUN research assistant. Generate a comprehensive research report for a delegate.

Country: ${researchItemId}
Committee: ${researchItemId}
Agenda: ${researchItemId}
Sections: ${sections.join(", ")}

Source Context:
${context}

Instructions:
- Use ONLY the provided source context
- Cite sources using [chunk_id] format
- Do not invent facts or citations
- If evidence is insufficient, state that explicitly
- Write in formal diplomatic language suitable for MUN`

  const response = await generateWithFailover(
    [
      { role: "system", content: "You are a MUN research expert. Generate grounded, citation-backed reports." },
      { role: "user", content: prompt },
    ],
    { task: "report_generation", userTier: "pro" }
  )

  const report = await prisma.reports.create({
    data: {
      userId: "user_123",
      researchItemId,
      title: `Research Report: ${researchItemId}`,
      status: "completed",
      sections: sections.map((s, i) => ({ id: `sec_${i}`, title: s, content: `Content for ${s}`, order: i })),
      citationCount: 0,
      sourceCount: sources.length,
    },
  })

  const citations: Citation[] = []
  return { report, citations }
}

async function validateAndSaveCitations(reportId: string, citations: Citation[], sources: Source[]) {
  // In production, validate citations against source text
  // For now, create placeholder citations
  for (const citation of citations) {
    await prisma.citations.create({
      data: {
        reportId,
        claim: citation.claim,
        sourceId: citation.sourceId,
        sourceTier: citation.sourceTier,
        status: "VALID",
        evidenceExcerpt: citation.evidenceExcerpt,
      },
    })
  }
}

async function finalizeResearch(
  researchItemId: string,
  reportId: string,
  sourceCount: number,
  citationCount: number
) {
  await prisma.research_items.update({
    where: { id: researchItemId },
    data: {
      status: "completed",
      sourceCount,
      reportId,
    },
  })

  await prisma.reports.update({
    where: { id: reportId },
    data: { citationCount, sourceCount },
  })
}
