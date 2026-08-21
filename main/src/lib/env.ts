/**
 * Centralized environment configuration.
 * All secrets use placeholder values until production keys are provided.
 */

function optional(key: string, fallback = ""): string {
  const value = process.env[key]
  return value && value.length > 0 ? value : fallback
}

export const env = {
  database: {
    url: optional("DATABASE_URL", "postgresql://placeholder:placeholder@localhost:5432/gemuni"),
    supabaseUrl: optional("NEXT_PUBLIC_SUPABASE_URL", "https://placeholder.supabase.co"),
    supabaseAnonKey: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY", "placeholder-anon-key"),
    supabaseServiceKey: optional("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-key"),
  },
  auth: {
    clerkPublishableKey: optional("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_placeholder"),
    clerkSecretKey: optional("CLERK_SECRET_KEY", "sk_test_placeholder"),
    jwtSecret: optional("JWT_SECRET", "dev-only-insecure-jwt-secret-change-me"),
  },
  research: {
    tavilyApiKey: optional("TAVILY_API_KEY", "tvly-placeholder"),
  },
  llm: {
    geminiApiKey: optional("GEMINI_API_KEY", "gemini-placeholder"),
    kimiApiKey: optional("KIMI_API_KEY", "kimi-placeholder"),
    openrouterApiKey: optional("OPENROUTER_API_KEY", "openrouter-placeholder"),
    openaiEmbeddingApiKey: optional("OPENAI_API_KEY", "sk-placeholder"),
    embeddingModel: optional("EMBEDDING_MODEL", "text-embedding-3-small"),
    embeddingDimensions: Number(optional("EMBEDDING_DIMENSIONS", "1536")),
  },
  inngest: {
    eventKey: optional("INNGEST_EVENT_KEY", "placeholder-event-key"),
    signingKey: optional("INNGEST_SIGNING_KEY", "placeholder-signing-key"),
  },
} as const

export function isProviderConfigured(provider: "tavily" | "gemini" | "kimi" | "openrouter" | "openai"): boolean {
  switch (provider) {
    case "tavily":
      return !env.research.tavilyApiKey.includes("placeholder")
    case "gemini":
      return !env.llm.geminiApiKey.includes("placeholder")
    case "kimi":
      return !env.llm.kimiApiKey.includes("placeholder")
    case "openrouter":
      return !env.llm.openrouterApiKey.includes("placeholder")
    case "openai":
      return !env.llm.openaiEmbeddingApiKey.includes("placeholder")
  }
}
