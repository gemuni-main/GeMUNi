import { NextResponse } from "next/server"
import { signOut } from "@/services/supabase-auth"

// POST /api/v1/auth/logout - Revoke the session server-side
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") ?? ""
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : ""

    await signOut(accessToken)

    return NextResponse.json({ success: true })
  } catch {
    // Logout is idempotent from the client's perspective.
    return NextResponse.json({ success: true })
  }
}