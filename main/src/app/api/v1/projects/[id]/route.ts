import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function findOwnedProject(id: string, userId: string) {
  const project = await prisma.projects.findUnique({ where: { id } })
  // Ownership enforced server-side: a project belonging to another user is "not found"
  if (!project || project.userId !== userId) return null
  return project
}

// GET /api/v1/projects/:id - Get single owned project
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = "user_123" // In production, resolved from auth session

    const project = await findOwnedProject(params.id, userId)
    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    console.error("Project fetch error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/projects/:id - Rename an owned project
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const userId = "user_123" // In production, resolved from auth session

    if (!name) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Project name is required" } },
        { status: 400 }
      )
    }

    const project = await findOwnedProject(params.id, userId)
    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      )
    }

    const updated = await prisma.projects.update({
      where: { id: params.id },
      data: { name },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Project update error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/projects/:id - Delete an owned project
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = "user_123" // In production, resolved from auth session

    const project = await findOwnedProject(params.id, userId)
    if (!project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found" } },
        { status: 404 }
      )
    }

    await prisma.projects.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Project delete error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    )
  }
}