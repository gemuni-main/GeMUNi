import { NextResponse } from "next/server"
import { verifyEmailToken } from "@/services/supabase-auth"

// POST /api/v1/auth/verify-email - Confirm a signup token
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const tokenHash = typeof body?.tokenHash === "string" ? body.tokenHash : ""

    if (!tokenHash) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Verification token is required" } },
        { status: 400 }
      )
    }

    const verified = await verifyEmailToken(tokenHash)

    if (!verified) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Invalid or expired verification link" } },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}