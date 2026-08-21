"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/scroll-area"
import { useParams } from "next/navigation"

type ResearchStatus = "queued" | "running" | "partially_completed" | "completed" | "failed" | "cancelled"

interface ResearchProgress {
  researchItemId: string
  status: ResearchStatus
  progress: number
  currentStep: string
  steps: {
    name: string
    status: "pending" | "running" | "completed" | "failed"
    details?: string
  }[]
  sourceCount: number
  error?: string
}

export default function ResearchProgressPage() {
  const params = useParams()
  const researchId = params.id as string
  const [progress, setProgress] = useState<ResearchProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/v1/research/${researchId}/status`)
        const data = await res.json()
        if (data.data) {
          setProgress(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
    const interval = setInterval(fetchProgress, 2000)
    return () => clearInterval(interval)
  }, [researchId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading research progress...</p>
        </div>
      </main>
    )
  }

  if (!progress) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy mb-2">Research Not Found</h2>
          <p className="text-muted-foreground">Unable to load research progress</p>
        </div>
      </main>
    )
  }

  const stepLabels = {
    queued: "Initializing",
    running: "Processing",
    partially_completed: "Partially Complete",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  }

  const statusColors = {
    queued: "text-blue-600",
    running: "text-yellow-600",
    partially_completed: "text-orange-600",
    completed: "text-green-600",
    failed: "text-red-600",
    cancelled: "text-gray-600",
  }

  const steps = [
    { key: "validate", label: "Validating Parameters", detail: "Checking country, committee, and agenda configuration" },
    { key: "tavily", label: "Searching Sources", detail: "Querying trusted sources via Tavily" },
    { key: "rank", label: "Ranking Sources", detail: "Scoring sources by reliability and relevance" },
    { key: "extract", label: "Extracting Content", detail: "Fetching and normalizing article content" },
    { key: "chunk", label: "Chunking Documents", detail: "Breaking content into semantic chunks" },
    { key: "embed", label: "Generating Embeddings", detail: "Creating vector embeddings with OpenAI" },
    { key: "store", label: "Storing Vectors", detail: "Saving embeddings to pgvector database" },
    { key: "retrieve", label: "Retrieving Context", detail: "Finding relevant passages for each section" },
    { key: "generate", label: "Generating Report", detail: "Writing grounded research report" },
    { key: "citations", label: "Validating Citations", detail: "Verifying all claims against sources" },
    { key: "complete", label: "Finalizing", detail: "Saving report and marking complete" },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Research in Progress</h1>
          <p className="text-muted-foreground">Research ID: {progress.researchItemId}</p>
        </div>

        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Overall Status</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[progress.status]}`}>
                {stepLabels[progress.status]}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Current: {progress.currentStep}</p>
            {progress.sourceCount > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Sources found: {progress.sourceCount}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pipeline Steps</h3>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const stepStatus = progress.steps.find(s => s.name === step.key)?.status || "pending"
                  const isCurrent = step.key === progress.currentStep.toLowerCase().replace(/\s+/g, "")

                  return (
                    <div
                      key={step.key}
                      className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                        isCurrent ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium">
                        {stepStatus === "completed" && <span className="text-green-600">✓</span>}
                        {stepStatus === "running" && <span className="animate-spin text-primary">◐</span>}
                        {stepStatus === "failed" && <span className="text-red-600">✗</span>}
                        {stepStatus === "pending" && <span className="text-muted-foreground">{index + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{step.label}</span>
                          {isCurrent && <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Current</span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {progress.status === "completed" && (
          <div className="mt-6 text-center">
            <Button asChild className="w-full md:w-auto">
              <a href={`/research/${researchId}/report`}>View Report</a>
            </Button>
          </div>
        )}

        {progress.status === "failed" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Research Failed</p>
            <p className="text-red-700 mt-1">{progress.error || "An unknown error occurred"}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
