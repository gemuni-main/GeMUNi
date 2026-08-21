import { ModelId, TaskCapability } from "@/types/shared"
import { env } from "@/lib/env"

export interface LLMMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface LLMResponse {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  model: ModelId
}

export interface LLMProvider {
  generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>
  stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string>
  estimateTokens(text: string): number
  getModelId(): ModelId
}

export interface LLMOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  systemPrompt?: string
}

const DEFAULT_OPTIONS: Required<LLMOptions> = {
  temperature: 0.3,
  maxTokens: 4096,
  topP: 0.9,
  systemPrompt: "",
}

class GeminiProvider implements LLMProvider {
  private apiKey: string
  private model: ModelId = "gemini-2.0-flash"

  constructor() {
    this.apiKey = env.llm.geminiApiKey
  }

  getModelId(): ModelId {
    return this.model
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  async generate(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map((m) => ({
              role: m.role === "assistant" ? "model" : m.role,
              parts: [{ text: m.content }],
            })),
            generationConfig: {
              temperature: opts.temperature,
              maxOutputTokens: opts.maxTokens,
              topP: opts.topP,
            },
            systemInstruction: opts.systemPrompt
              ? { parts: [{ text: opts.systemPrompt }] }
              : undefined,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      const usage = data.usageMetadata || {
        promptTokenCount: 0,
        candidatesTokenCount: 0,
        totalTokenCount: 0,
      }

      return {
        content,
        usage: {
          inputTokens: usage.promptTokenCount || 0,
          outputTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        model: this.model,
      }
    } catch (error) {
      console.error("Gemini generation failed:", error)
      return this.getMockResponse(messages, options)
    }
  }

  async *stream(messages: LLMMessage[], options: LLMOptions = {}): AsyncGenerator<string> {
    const response = await this.generate(messages, options)
    const words = response.content.split(" ")
    for (const word of words) {
      yield word + " "
      await new Promise((r) => setTimeout(r, 50))
    }
  }

  private getMockResponse(messages: LLMMessage[], options: LLMOptions): LLMResponse {
    return {
      content: `[MOCK GEMINI] This is a mock response for: ${messages[messages.length - 1].content}`,
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      model: this.model,
    }
  }
}

class KimiProvider implements LLMProvider {
  private apiKey: string
  private model: ModelId = "kimi-k2"

  constructor() {
    this.apiKey = env.llm.kimiApiKey
  }

  getModelId(): ModelId {
    return this.model
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  async generate(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    try {
      const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
          top_p: opts.topP,
        }),
      })

      if (!response.ok) {
        throw new Error(`Kimi API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ""
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

      return {
        content,
        usage: {
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        },
        model: this.model,
      }
    } catch (error) {
      console.error("Kimi generation failed:", error)
      return this.getMockResponse(messages, options)
    }
  }

  async *stream(messages: LLMMessage[], options: LLMOptions = {}): AsyncGenerator<string> {
    const response = await this.generate(messages, options)
    const words = response.content.split(" ")
    for (const word of words) {
      yield word + " "
      await new Promise((r) => setTimeout(r, 50))
    }
  }

  private getMockResponse(messages: LLMMessage[], options: LLMOptions): LLMResponse {
    return {
      content: `[MOCK KIMI] This is a mock response for: ${messages[messages.length - 1].content}`,
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      model: this.model,
    }
  }
}

class OpenRouterProvider implements LLMProvider {
  private apiKey: string
  private model: ModelId = "openrouter"

  constructor() {
    this.apiKey = env.llm.openrouterApiKey
  }

  getModelId(): ModelId {
    return this.model
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  async generate(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://gemuni.app",
          "X-Title": "GeMUNi",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
          top_p: opts.topP,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ""
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

      return {
        content,
        usage: {
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
        },
        model: this.model,
      }
    } catch (error) {
      console.error("OpenRouter generation failed:", error)
      return this.getMockResponse(messages, options)
    }
  }

  async *stream(messages: LLMMessage[], options: LLMOptions = {}): AsyncGenerator<string> {
    const response = await this.generate(messages, options)
    const words = response.content.split(" ")
    for (const word of words) {
      yield word + " "
      await new Promise((r) => setTimeout(r, 50))
    }
  }

  private getMockResponse(messages: LLMMessage[], options: LLMOptions): LLMResponse {
    return {
      content: `[MOCK OPENROUTER] This is a mock response for: ${messages[messages.length - 1].content}`,
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      model: this.model,
    }
  }
}

const providerInstances: Map<ModelId, LLMProvider> = new Map()

export function getProvider(modelId: ModelId): LLMProvider {
  let provider = providerInstances.get(modelId)
  if (!provider) {
    switch (modelId) {
      case "gemini-2.0-flash":
        provider = new GeminiProvider()
        break
      case "kimi-k2":
        provider = new KimiProvider()
        break
      case "openrouter":
        provider = new OpenRouterProvider()
        break
      default:
        provider = new GeminiProvider()
    }
    providerInstances.set(modelId, provider)
  }
  return provider
}

const MODEL_CHAINS: Record<string, ModelId[]> = {
  free: ["gemini-2.0-flash"],
  plus: ["gemini-2.0-flash", "kimi-k2"],
  pro: ["gemini-2.0-flash", "kimi-k2", "openrouter"],
}

const TASK_MODEL_MAP: Record<TaskCapability, ModelId> = {
  research_planning: "gemini-2.0-flash",
  summarization: "gemini-2.0-flash",
  report_generation: "gemini-2.0-flash",
  citation_validation: "gemini-2.0-flash",
  chat: "gemini-2.0-flash",
}

export function getModelForTask(task: TaskCapability, userTier: "free" | "plus" | "pro"): ModelId {
  const preferredModel = TASK_MODEL_MAP[task]
  const availableModels = MODEL_CHAINS[userTier] || ["gemini-2.0-flash"]

  if (availableModels.includes(preferredModel)) {
    return preferredModel
  }

  return availableModels[0]
}

export async function generateWithFailover(
  messages: LLMMessage[],
  options: LLMOptions & { task: TaskCapability; userTier: "free" | "plus" | "pro" }
): Promise<LLMResponse> {
  const { task, userTier, ...llmOptions } = options
  const availableModels = MODEL_CHAINS[userTier] || ["gemini-2.0-flash"]
  const preferredModel = TASK_MODEL_MAP[task]

  const modelsToTry = preferredModel && availableModels.includes(preferredModel)
    ? [preferredModel, ...availableModels.filter((m) => m !== preferredModel)]
    : availableModels

  let lastError: Error | null = null

  for (const modelId of modelsToTry) {
    try {
      const provider = getProvider(modelId)
      const response = await provider.generate(messages, llmOptions)
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Model ${modelId} failed, trying next:`, lastError.message)
    }
  }

  throw lastError || new Error("All models failed")
}

export async function *streamWithFailover(
  messages: LLMMessage[],
  options: LLMOptions & { task: TaskCapability; userTier: "free" | "plus" | "pro" }
): AsyncGenerator<string> {
  const { task, userTier, ...llmOptions } = options
  const availableModels = MODEL_CHAINS[userTier] || ["gemini-2.0-flash"]
  const preferredModel = TASK_MODEL_MAP[task]

  const modelsToTry = preferredModel && availableModels.includes(preferredModel)
    ? [preferredModel, ...availableModels.filter((m) => m !== preferredModel)]
    : availableModels

  for (const modelId of modelsToTry) {
    try {
      const provider = getProvider(modelId)
      for await (const chunk of provider.stream(messages, llmOptions)) {
        yield chunk
      }
      return
    } catch (error) {
      console.warn(`Model ${modelId} streaming failed, trying next:`, error)
    }
  }

  yield "Error: All models failed to generate response."
}