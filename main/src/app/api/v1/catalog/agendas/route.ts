import { NextResponse } from "next/server"

// GET /api/v1/catalog/agendas
export async function GET(request: Request) {
  const agendas = [
    { id: "1", title: "Climate Migration", description: "Managing migration driven by climate change", committeeCompatibility: ["UNSC", "UNGA", "UNHRC"] },
    { id: "2", title: "Digital Privacy", description: "Protecting privacy in the digital age", committeeCompatibility: ["UNGA", "UNHRC"] },
    { id: "3", title: "Water Scarcity", description: "Addressing global water scarcity and management", committeeCompatibility: ["UNGA", "UNEP"] },
    { id: "4", title: "Arms Control", description: "Regulating conventional and unconventional weapons", committeeCompatibility: ["UNSC"] },
    { id: "5", title: "Health Emergencies", description: "Global health emergency preparedness and response", committeeCompatibility: ["WHO", "UNHRC"] },
    { id: "6", title: "Space Security", description: "Preventing an arms race in outer space", committeeCompatibility: ["UNGA", "UNSC"] },
    { id: "7", title: "Ocean Plastic Pollution", description: "Reducing plastic pollution in oceans", committeeCompatibility: ["UNEP", "UNGA"] },
    { id: "8", title: "Artificial Intelligence Governance", description: "International governance of AI development", committeeCompatibility: ["UNGA", "UNHRC"] },
  ]

  return NextResponse.json({ data: agendas })
}