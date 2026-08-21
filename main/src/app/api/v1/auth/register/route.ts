import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/v1/auth/register - Register a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, displayName } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Email and password are required" } },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: { code: "USER_EXISTS", message: "User with this email already exists" } },
        { status: 409 }
      )
    }

    // Create user in auth and our database
    // Note: In production, use proper password hashing (bcrypt)
    const user = await prisma.users.create({
      data: {
        email,
        displayName,
        tier: "free",
      },
    })

    return NextResponse.json(
      { data: { userId: user.id, email: user.email, tier: user.tier } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Auth registration error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}