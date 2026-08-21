import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/account/usage - Get usage statistics
export async function GET(request: Request) {
  try {
    const userId = "user_123" // In production, resolved from auth session

    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const dailyUsage = await prisma.usage_records.count({
      where: {
        userId,
        createdAt: { gte: dayStart },
      },
    })

    const monthlyUsage = await prisma.usage_records.count({
      where: {
        userId,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    })

    return NextResponse.json({
      data: {
        dailyUsage,
        monthlyUsage,
        period: {
          dayStart: dayStart.toISOString(),
          monthStart: monthStart.toISOString(),
          monthEnd: monthEnd.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("Usage fetch error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}