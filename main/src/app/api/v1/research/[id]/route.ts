import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/research/:id - Get research item detail
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const userId = "user_123" // In production, resolved from auth session

    const researchItem = await prisma.research_items.findUnique({ where: { id } })

    if (!researchItem || researchItem.userId !== userId) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Research item not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: researchItem })
  } catch (error) {
    console.error("Research fetch error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}