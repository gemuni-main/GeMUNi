import { ReliabilityTier } from "../types/shared"

export function formatReliabilityTier(tier: ReliabilityTier): string {
  switch (tier) {
    case "UN":
      return "★★★★★ UN SOURCE"
    case "OFFICIAL":
      return "★★★★☆ OFFICIAL SOURCE"
    case "IO":
      return "★★★★☆ INTERNATIONAL ORGANIZATION"
    case "NGO":
      return "★★★☆☆ NGO"
    case "ACADEMIC":
      return "★★★☆☆ ACADEMIC"
    case "MEDIA":
      return "★★★☆☆ ESTABLISHED MEDIA"
    case "OTHER":
      return "★★☆☆☆ OTHER"
    default:
      return "UNKNOWN"
  }
}

export function reliabilityTierColor(tier: ReliabilityTier): string {
  switch (tier) {
    case "UN":
      return "bg-blue-500 text-white"
    case "OFFICIAL":
      return "bg-green-500 text-white"
    case "IO":
      return "bg-purple-500 text-white"
    case "NGO":
      return "bg-orange-500 text-white"
    case "ACADEMIC":
      return "bg-green-600 text-white"
    case "MEDIA":
      return "bg-blue-600 text-white"
    case "OTHER":
      return "bg-gray-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + "…"
}

export function sortSourcesByReliability(
  a: { tier: ReliabilityTier },
  b: { tier: ReliabilityTier }
): number {
  const order: ReliabilityTier[] = ["UN", "OFFICIAL", "IO", "NGO", "ACADEMIC", "MEDIA", "OTHER"]
  const aIndex = order.indexOf(a.tier)
  const bIndex = order.indexOf(b.tier)
  return aIndex - bIndex
}