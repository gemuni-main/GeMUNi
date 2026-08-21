import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/v1/projects - List user's projects
export async function GET(request: Request) {
  try {
    const userId = "user_123" // In production, resolved from auth session

    const projects = await prisma.projects.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: projects })
  } catch (error) {
    console.error("Projects list error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}

// POST /api/v1/projects - Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const reportId = typeof body?.reportId === "string" ? body.reportId : null
    const userId = "user_123" // In production, resolved from auth session

    if (!name) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Project name is required" } },
        { status: 400 }
      )
    }

    const project = await prisma.projects.create({
      data: { userId, name, reportId },
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error("Project creation error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}