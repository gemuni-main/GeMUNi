import { NextResponse } from "next/server"
import { TIER_ENTITLEMENTS } from "@/lib/entitlements"

// GET /api/v1/account/entitlements - Get entitlements for the user's tier
export async function GET(request: Request) {
  try {
    const tier = "free" as keyof typeof TIER_ENTITLEMENTS // In production, resolved from auth session

    return NextResponse.json({
      data: { tier, ...TIER_ENTITLEMENTS[tier] },
    })
  } catch (error) {
    console.error("Entitlements fetch error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}