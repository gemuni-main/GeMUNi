import { NextResponse } from "next/server"
import { requestPasswordReset } from "@/services/supabase-auth"

// POST /api/v1/auth/password-reset - Send a recovery email
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email is required" } },
        { status: 400 }
      )
    }

    // Always report success to prevent account enumeration.
    await requestPasswordReset(email)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}