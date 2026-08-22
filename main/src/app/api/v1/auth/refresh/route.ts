import { NextResponse } from "next/server"
import { refreshSession } from "@/services/supabase-auth"

// POST /api/v1/auth/refresh - Rotate an access token using a refresh token
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : ""

    if (!refreshToken) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Refresh token is required" } },
        { status: 400 }
      )
    }

    const { session, error } = await refreshSession(refreshToken)

    if (error || !session) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: error?.message ?? "Invalid refresh token" } },
        { status: 401 }
      )
    }

    return NextResponse.json({
      data: {
        userId: session.userId,
        email: session.email,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
    })
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}