import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/v1/research/:id/chat - Grounded chat about a completed research report
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const message = typeof body?.message === "string" ? body.message : ""
    const { id } = params
    const userId = "user_123" // In production, resolved from auth session

    if (!message.trim()) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Message is required" } },
        { status: 400 }
      )
    }

    const researchItem = await prisma.research_items.findUnique({ where: { id } })

    if (!researchItem || researchItem.userId !== userId) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Research item not found" } },
        { status: 404 }
      )
    }

    // In production, this retrieves relevant chunks via pgvector and calls the
    // grounded LLM chain with citation validation. Placeholder until keys are set.
    const response = {
      role: "assistant" as const,
      content:
        "I couldn't find enough evidence in the saved research to answer that confidently. Research-grounded answers will be available once provider keys are configured.",
      citations: [] as string[],
    }

    await prisma.chat_messages.create({
      data: {
        reportId: researchItem.reportId ?? null,
        role: "user",
        content: message,
        citations: [],
      },
    })

    await prisma.chat_messages.create({
      data: {
        reportId: researchItem.reportId ?? null,
        role: "assistant",
        content: response.content,
        citations: [],
      },
    })

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error("Research chat error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}