import { NextResponse } from "next/server"

// GET /api/v1/catalog/countries
export async function GET(request: Request) {
  // In production, fetch from database or return seeded data
  const countries = [
    { id: "1", name: "United States", isoCode: "US", flagEmoji: "🇺🇸" },
    { id: "2", name: "United Kingdom", isoCode: "UK", flagEmoji: "🇬🇧" },
    { id: "3", name: "China", isoCode: "CN", flagEmoji: "🇨🇳" },
    { id: "4", name: "Russia", isoCode: "RU", flagEmoji: "🇷🇺" },
    { id: "5", name: "France", isoCode: "FR", flagEmoji: "🇫🇷" },
    { id: "6", name: "Germany", isoCode: "DE", flagEmoji: "🇩🇪" },
    { id: "7", name: "Japan", isoCode: "JP", flagEmoji: "🇯🇵" },
    { id: "8", name: "Brazil", isoCode: "BR", flagEmoji: "🇧🇷" },
    { id: "9", name: "India", isoCode: "IN", flagEmoji: "🇮🇳" },
    { id: "10", name: "Canada", isoCode: "CA", flagEmoji: "🇨🇦" },
  ]

  return NextResponse.json({ data: countries })
}