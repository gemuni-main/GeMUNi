import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/research - List user's research items
export async function GET(request: Request) {
  try {
    const userId = "user_123" // In production, resolved from auth session

    const researchItems = await prisma.research_items.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: researchItems })
  } catch (error) {
    console.error("Research list error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}

// POST /api/v1/research - Create a new research job
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { countryId, committeeId, agendaId, config } = body

    if (!countryId || !committeeId || !agendaId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Country, committee, and agenda are required" } },
        { status: 400 }
      )
    }

    // Entitlement check happens before enqueueing in production
    const userId = "user_123" // In production, resolved from auth session

    const researchItem = await prisma.research_items.create({
      data: {
        userId,
        countryId,
        committeeId,
        agendaId,
        status: "queued",
        config,
      },
    })

    await inngestSend(researchItem.id, userId, countryId, committeeId, agendaId, config)

    return NextResponse.json(
      { data: { researchItemId: researchItem.id, status: researchItem.status } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Research creation error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}

async function inngestSend(
  researchItemId: string,
  userId: string,
  countryId: unknown,
  committeeId: unknown,
  agendaId: unknown,
  config: unknown
) {
  const { inngest } = await import("@/lib/inngest")
  await inngest.send({
    name: "research/started",
    data: { researchItemId, userId, countryId, committeeId, agendaId, config },
  })
}