import { NextResponse } from "next/server"

// GET /api/v1/catalog/committees
export async function GET(request: Request) {
  const committees = [
    { id: "1", name: "Security Council", acronym: "UNSC", description: "Maintain international peace and security", difficulty: "advanced" },
    { id: "2", name: "General Assembly", acronym: "UNGA", description: "Deliberative body of all UN member states", difficulty: "beginner" },
    { id: "3", name: "Human Rights Council", acronym: "UNHRC", description: "Promote and protect human rights globally", difficulty: "intermediate" },
    { id: "4", name: "World Health Organization", acronym: "WHO", description: "Directing and coordinating authority for international health", difficulty: "intermediate" },
    { id: "5", name: "United Nations Environment Programme", acronym: "UNEP", description: "Environmental issues at global level", difficulty: "intermediate" },
    { id: "6", name: "International Court of Justice", acronym: "ICJ", description: "Principal judicial organ of the UN", difficulty: "advanced" },
    { id: "7", name: "Economic and Social Council", acronym: "ECOSOC", description: "Coordination of economic and social fields", difficulty: "beginner" },
    { id: "8", name: "UNICEF", acronym: "UNICEF", description: "Children's fund of the United Nations", difficulty: "beginner" },
  ]

  return NextResponse.json({ data: committees })
}