/**
 * Centralized entitlement definitions — single source of truth for tiers.
 * Used by API routes, usage metering, and model routing.
 */
export const TIER_ENTITLEMENTS = {
  free: {
    monthlyResearchLimit: 5,
    dailyResearchLimit: 1,
    maxReportDepth: "standard",
    accessToModels: ["gemini-2.0-flash"],
  },
  plus: {
    monthlyResearchLimit: 20,
    dailyResearchLimit: 3,
    maxReportDepth: "deep",
    accessToModels: ["gemini-2.0-flash", "kimi-k2"],
  },
  pro: {
    monthlyResearchLimit: 100,
    dailyResearchLimit: 10,
    maxReportDepth: "deep",
    accessToModels: ["gemini-2.0-flash", "kimi-k2", "openrouter"],
  },
} as const

export type Tier = keyof typeof TIER_ENTITLEMENTS