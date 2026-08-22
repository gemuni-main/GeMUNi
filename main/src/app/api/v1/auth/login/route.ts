import { NextResponse } from "next/server"
import { signIn } from "@/services/supabase-auth"

// POST /api/v1/auth/login - Sign in with email + password
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email and password are required" } },
        { status: 400 }
      )
    }

    const { session, error } = await signIn(email, password)

    if (error || !session) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_CREDENTIALS",
            message: error?.message ?? "Invalid email or password",
          },
        },
        { status: error?.status ?? 401 }
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