"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/scroll-area"
import { reliabilityTierColor, formatReliabilityTier } from "@/lib/utils"
import { useParams } from "next/navigation"
import { ReliabilityTier } from "@/types/shared"

interface Source {
  id: string
  title: string
  url: string
  publisher: string
  tier: ReliabilityTier
  relevanceScore: number
  retrievedAt: string
  contentHash: string
}

interface Citation {
  id: string
  claim: string
  sourceId: string
  sourceTier: ReliabilityTier
  status: "VALID" | "INVALID" | "PARTIAL" | "UNCERTAIN"
  evidenceExcerpt: string | null
}

interface ReportSection {
  id: string
  title: string
  content: string
  order: number
}

interface ReportData {
  id: string
  title: string
  status: string
  sections: ReportSection[]
  citationCount: number
  sourceCount: number
  citations: Citation[]
  sources: Source[]
  createdAt: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  citations: string[]
  createdAt: string
}

export default function ResearchReportPage() {
  const params = useParams()
  const researchId = params.id as string
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/v1/research/${researchId}`)
        const data = await res.json()
        if (data.data?.report) {
          setReport(data.data.report)
        }
      } catch (error) {
        console.error("Failed to fetch report:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [researchId])

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: chatInput,
      citations: [],
      createdAt: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput("")
    setChatLoading(true)

    try {
      const res = await fetch(`/api/v1/research/${researchId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      })

      const data = await res.json()
      if (data.data) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now() + 1}`,
            role: "assistant",
            content: data.data.content,
            citations: data.data.citations || [],
            createdAt: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Failed to send chat message:", error)
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "I'm sorry, I couldn't process your question. Please try again.",
          citations: [],
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading research report...</p>
        </div>
      </main>
    )
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy mb-2">Report Not Found</h2>
          <p className="text-muted-foreground">Unable to load the research report</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">{report.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Citations: {report.citationCount}</span>
            <span>Sources: {report.sourceCount}</span>
            <span>Status: {report.status}</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {report.sections.map((section) => (
              <Card key={section.id} className="p-6">
                <h2 className="text-xl font-semibold text-navy mb-4 border-b pb-2">
                  {section.title}
                </h2>
                <div className="prose max-w-none text-gray-800">
                  {section.content.split("\n").map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </Card>
            ))}

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-navy mb-4">Ask AI Assistant</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask questions about this research. Answers are grounded in the saved sources.
              </p>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {chatMessages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Start a conversation by asking a question below...
                  </p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.citations.map((citeId) => (
                              <span
                                key={citeId}
                                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded cursor-pointer hover:bg-primary/20"
                              >
                                [{citeId}]
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Ask about this research..."
                  disabled={chatLoading}
                />
                <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}>
                  {chatLoading ? "Sending..." : "Send"}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-navy mb-4">Sources</h2>
              <div className="space-y-3">
                {report.sources.map((source) => (
                  <div
                    key={source.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedSource(source)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{source.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{source.publisher} • {new Date(source.retrievedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`${reliabilityTierColor(source.tier)} px-2 py-1 rounded text-xs font-medium`}>
                        {formatReliabilityTier(source.tier)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24 h-fit">
              <h3 className="font-semibold mb-4">Citations</h3>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {report.citations.map((citation) => (
                  <div
                    key={citation.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCitation(citation)}
                  >
                    <p className="text-sm line-clamp-2">{citation.claim}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        {citation.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatReliabilityTier(citation.sourceTier)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {selectedCitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Citation Details</h3>
                  <button onClick={() => setSelectedCitation(null)} className="text-muted-foreground hover:text-foreground">
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <p className="font-medium mb-2">Claim</p>
                <p className="mb-4">{selectedCitation.claim}</p>
                <p className="font-medium mb-2">Status: <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{selectedCitation.status}</span></p>
                {selectedCitation.evidenceExcerpt && (
                  <div className="mt-4 p-3 bg-muted rounded">
                    <p className="font-medium mb-2">Evidence Excerpt</p>
                    <p className="text-sm">{selectedCitation.evidenceExcerpt}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {selectedSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Source Details</h3>
                  <button onClick={() => setSelectedSource(null)} className="text-muted-foreground hover:text-foreground">
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <h3 className="text-lg font-semibold mb-2">{selectedSource.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedSource.publisher}</p>
                <a href={selectedSource.url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm mb-4 block truncate">{selectedSource.url}</a>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Tier: </span>
                    <span className={`${reliabilityTierColor(selectedSource.tier)} px-2 py-1 rounded text-xs font-medium`}>{formatReliabilityTier(selectedSource.tier)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retrieved: </span>
                    <span>{new Date(selectedSource.retrievedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Relevance: </span>
                    <span>{(selectedSource.relevanceScore * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Content Hash: </span>
                    <span className="font-mono text-xs">{selectedSource.contentHash.substring(0, 16)}...</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
