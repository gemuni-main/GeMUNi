import { describe, it, expect } from "vitest"
import { isSafeExternalUrl, assertSafeExternalUrl } from "./url-safety"

describe("isSafeExternalUrl", () => {
  it("allows public https URLs", () => {
    const result = isSafeExternalUrl("https://www.un.org/en/about-us")
    expect(result.safe).toBe(true)
    expect(result.normalizedUrl).toBe("https://www.un.org/en/about-us")
  })

  it("allows public http URLs", () => {
    const result = isSafeExternalUrl("http://example.com/page")
    expect(result.safe).toBe(true)
  })

  it("rejects malformed URLs", () => {
    expect(isSafeExternalUrl("not a url").safe).toBe(false)
  })

  it.each([
    "http://localhost:3000/admin",
    "https://localhost/x",
    "http://127.0.0.1/",
    "http://10.0.0.1/internal",
    "http://172.16.0.5/private",
    "http://192.168.1.1/router",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]:8080/",
    "file:///etc/passwd",
    "ftp://example.com/file",
  ])("blocks unsafe URL %s", (url) => {
    const result = isSafeExternalUrl(url)
    expect(result.safe).toBe(false)
    expect(result.reason).toBeDefined()
  })

  it("blocks cloud metadata endpoints by hostname", () => {
    expect(isSafeExternalUrl("http://metadata.google.internal/computeMetadata/v1/").safe).toBe(false)
  })

  it("blocks URLs with embedded credentials", () => {
    expect(isSafeExternalUrl("https://user:pass@example.com/").safe).toBe(false)
  })
})

describe("assertSafeExternalUrl", () => {
  it("returns the normalized URL when safe", () => {
    expect(assertSafeExternalUrl("https://who.int/")).toBe("https://who.int/")
  })

  it("throws for unsafe URLs", () => {
    expect(() => assertSafeExternalUrl("http://127.0.0.1/")).toThrow(/Unsafe URL/)
  })
})