import { NextResponse } from "next/server"
import { signUp } from "@/services/supabase-auth"

// POST /api/v1/auth/register - Register a new user via Supabase Auth
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body?.password === "string" ? body.password : ""
    const displayName =
      typeof body?.displayName === "string" ? body.displayName.trim() : undefined

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email and password are required" } },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email address" } },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" } },
        { status: 400 }
      )
    }

    const { session, error } = await signUp(email, password, displayName)

    if (error) {
      const code = error.status === 409 ? "USER_EXISTS" : "REGISTRATION_FAILED"
      return NextResponse.json(
        { error: { code, message: error.message } },
        { status: error.status }
      )
    }

    return NextResponse.json(
      {
        data: session
          ? {
              userId: session.userId,
              email: session.email,
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              expiresAt: session.expiresAt,
            }
          : { message: "Check your email to confirm your account." },
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}