/**
 * URL safety validation for server-side fetching.
 * Prevents SSRF by blocking private networks, loopback, and cloud metadata endpoints.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
])

const BLOCKED_IP_PATTERNS = [
  /^127\./, // IPv4 loopback
  /^10\./, // Private class A
  /^172\.(1[6-9]|2\d|3[01])\./, // Private class B
  /^192\.168\./, // Private class C
  /^169\.254\./, // Link-local (includes AWS IMDS 169.254.169.254)
  /^0\./, // Unspecified
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT range
  /^::1$/, // IPv6 loopback
  /^\[?::1\]?$/,
  /^fc00:/i, // IPv6 unique local
  /^fd[0-9a-f]{2}:/i, // IPv6 unique local
  /^fe80:/i, // IPv6 link-local
]

export interface UrlSafetyResult {
  safe: boolean
  reason?: string
  normalizedUrl?: string
}

export function isSafeExternalUrl(rawUrl: string): UrlSafetyResult {
  let url: URL

  try {
    url = new URL(rawUrl)
  } catch {
    return { safe: false, reason: "Invalid URL format" }
  }

  // Only allow http(s)
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { safe: false, reason: `Protocol ${url.protocol} is not allowed` }
  }

  const hostname = url.hostname.toLowerCase()

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { safe: false, reason: `Hostname ${hostname} is blocked` }
  }

  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { safe: false, reason: `Address ${hostname} resolves to a blocked range` }
    }
  }

  // Block credentials in URL (phishing/internal confusion)
  if (url.username || url.password) {
    return { safe: false, reason: "URLs with embedded credentials are not allowed" }
  }

  return { safe: true, normalizedUrl: url.toString() }
}

export function assertSafeExternalUrl(rawUrl: string): string {
  const result = isSafeExternalUrl(rawUrl)
  if (!result.safe) {
    throw new Error(`Unsafe URL rejected: ${result.reason}`)
  }
  return result.normalizedUrl as string
}

/**
 * Fetch with timeout, size cap, and content-type guard for source extraction.
 */
export async function safeFetch(
  rawUrl: string,
  options: { timeoutMs?: number; maxBytes?: number } = {}
): Promise<{ ok: boolean; status?: number; text?: string; error?: string }> {
  const { timeoutMs = 10_000, maxBytes = 2_000_000 } = options

  let normalized: string
  try {
    normalized = assertSafeExternalUrl(rawUrl)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unsafe URL" }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(normalized, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "GeMUNiResearchBot/1.0 (+https://gemuni.app)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
    })

    if (!res.ok) {
      return { ok: false, status: res.status, error: `HTTP ${res.status}` }
    }

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("text/") && !contentType.includes("json") && !contentType.includes("xml")) {
      return { ok: false, status: res.status, error: `Unsupported content type: ${contentType}` }
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > maxBytes) {
      return { ok: false, status: res.status, error: "Content exceeds maximum size" }
    }

    return { ok: true, status: res.status, text: new TextDecoder().decode(buffer.slice(0, maxBytes)) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: message === "This operation was aborted" ? "Request timed out" : message }
  } finally {
    clearTimeout(timer)
  }
}
