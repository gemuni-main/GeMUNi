/**
 * Supabase Auth service — real credential handling for the /api/v1/auth routes.
 * Uses the anon key for user-facing flows and the service-role key only
 * server-side for profile provisioning.
 */
import { env } from "@/lib/env"

const BASE = env.database.supabaseUrl.replace(/\/$/, "")
const ANON_KEY = env.database.supabaseAnonKey
const SERVICE_KEY = env.database.supabaseServiceKey

export interface SupabaseSession {
  accessToken: string
  refreshToken: string
  expiresAt: number // unix seconds
  userId: string
  email: string
}

export interface SupabaseAuthError {
  status: number
  message: string
}

function isConfigured(): boolean {
  return !BASE.includes("placeholder") && !ANON_KEY.includes("placeholder")
}

async function supabaseFetch(
  path: string,
  init: RequestInit,
  key: string
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(init.headers ?? {}),
    },
  })

  let data: any = null
  try {
    data = await res.json()
  } catch {}

  return { ok: res.ok, status: res.status, data }
}

function toSession(data: any): SupabaseSession {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    userId: data.user?.id ?? "",
    email: data.user?.email ?? "",
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<{ session?: SupabaseSession; error?: SupabaseAuthError }> {
  if (!isConfigured()) {
    return { error: { status: 503, message: "Auth provider not configured" } }
  }

  const { ok, status, data } = await supabaseFetch(
    "/auth/v1/signup",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: display_name_payload(displayName),
      }),
    },
    ANON_KEY
  )

  if (!ok) {
    return {
      error: {
        status: status === 422 ? 409 : sanitizeStatus(status),
        message: data?.msg || data?.error_description || data?.message || "Registration failed",
      },
    }
  }

  const session = data.access_token ? toSession(data) : undefined
  await provisionProfile(session?.userId, email, displayName)
  return { session }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ session?: SupabaseSession; error?: SupabaseAuthError }> {
  if (!isConfigured()) {
    return { error: { status: 503, message: "Auth provider not configured" } }
  }

  const { ok, status, data } = await supabaseFetch(
    "/auth/v1/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    ANON_KEY
  )

  if (!ok) {
    return {
      error: {
        // Supabase reports invalid credentials as 400 on this grant;
        // surface them to clients as 401.
        status: status === 400 ? 401 : sanitizeStatus(status),
        message:
          status === 400 ? "Invalid email or password" : "Sign-in failed. Try again later.",
      },
    }
  }

  return { session: toSession(data) }
}

export async function refreshSession(
  refreshToken: string
): Promise<{ session?: SupabaseSession; error?: SupabaseAuthError }> {
  if (!isConfigured()) {
    return { error: { status: 503, message: "Auth provider not configured" } }
  }

  const { ok, status, data } = await supabaseFetch(
    "/auth/v1/token?grant_type=refresh_token",
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
    ANON_KEY
  )

  if (!ok) {
    return {
      error: { status: sanitizeStatus(status), message: "Invalid or expired refresh token" },
    }
  }

  return { session: toSession(data) }
}

export async function signOut(accessToken: string): Promise<void> {
  if (!isConfigured() || !accessToken) return
  try {
    await supabaseFetch("/auth/v1/logout?scope=global", { method: "POST" }, accessToken)
  } catch {
    // Logout is best-effort; the client discards tokens regardless.
  }
}

export async function verifyEmailToken(tokenHash: string): Promise<boolean> {
  if (!isConfigured()) return false
  const { ok } = await supabaseFetch(
    "/auth/v1/verify",
    {
      method: "POST",
      body: JSON.stringify({ type: "signup", token_hash: tokenHash }),
    },
    ANON_KEY
  )
  return ok
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  if (!isConfigured()) return false
  const { ok } = await supabaseFetch(
    "/auth/v1/recover",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    ANON_KEY
  )
  return ok
}

/** Upsert the application profile row (service role; bypasses RLS by design). */
async function provisionProfile(
  userId: string | undefined,
  email: string,
  displayName?: string
): Promise<void> {
  if (SERVICE_KEY.includes("placeholder")) return

  const payload: Record<string, unknown> = {
    email,
    ...(displayName ? { display_name: displayName } : {}),
    ...(userId ? { id: userId } : {}),
  }

  try {
    await fetch(`${BASE}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    })
  } catch {
    // Profile provisioning is retried on next login; never block auth.
  }
}

function sanitizeStatus(status: number): number {
  // Never leak provider internals: normalize credential failures to 401,
  // but preserve rate limiting (429) so clients can back off.
  if (status === 401) return 401
  if (status === 429) return 429
  return 400
}

function display_name_payload(displayName?: string) {
  return displayName ? { display_name: displayName } : {}
}