import { describe, it, expect } from "vitest"
import { generateWithFailover } from "./llm"

/**
 * Integration test — hits the real OpenRouter API.
 * Opt-in only: RUN_LLM_INTEGRATION=1 pnpm exec vitest run src/services/llm.integration.test.ts
 */
const maybe = process.env.RUN_LLM_INTEGRATION === "1" ? describe : describe.skip

maybe("LLM provider chain (integration)", () => {
  it(
    "generates a real completion via OpenRouter after skipping unconfigured providers",
    { timeout: 60_000 },
    async () => {
      const response = await generateWithFailover(
        [
          {
            role: "system",
            content:
              "You are a MUN research assistant. Answer only from supplied evidence.",
          },
          {
            role: "user",
            content:
              "In one sentence, state the primary purpose of the UN Security Council according to general knowledge.",
          },
        ],
        {
          task: "chat",
          userTier: "pro",
          maxTokens: 100,
          temperature: 0,
        }
      )

      expect(response.content.length).toBeGreaterThan(10)
      expect(response.usage.totalTokens).toBeGreaterThan(0)
      console.log("[integration] model used:", response.model)
      console.log("[integration] content:", response.content.slice(0, 120))
    }
  )
})