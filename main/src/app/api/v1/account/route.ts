import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/account - Get user account
export async function GET(request: Request) {
  try {
    const userId = "user_123" // In production, resolved from auth session

    const user = await prisma.users.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName ?? null,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Account fetch error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}