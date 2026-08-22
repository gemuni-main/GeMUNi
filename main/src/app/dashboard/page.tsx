"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" }> = {
  queued: { label: "Queued", variant: "default" },
  running: { label: "Running", variant: "primary" },
  partially_completed: { label: "Partial", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "default" },
}

const TIER_LIMITS = {
  free: { label: "Free", limit: 5 },
  plus: { label: "Plus", limit: 20 },
  pro: { label: "Pro", limit: 100 },
} as const

export default function Dashboard() {
  const [userTier, setUserTier] = useState<keyof typeof TIER_LIMITS>("free")
  const [dailyUsage, setDailyUsage] = useState(0)
  const [monthlyUsage, setMonthlyUsage] = useState(0)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      fetch("/api/v1/account").then((r) => r.json()).catch(() => null),
      fetch("/api/v1/account/usage").then((r) => r.json()).catch(() => null),
      fetch("/api/v1/projects").then((r) => r.json()).catch(() => null),
    ]).then(([account, usage, projectsRes]) => {
      if (!active) return
      if (account?.data?.tier && account.data.tier in TIER_LIMITS) {
        setUserTier(account.data.tier)
      }
      if (usage?.data) {
        setDailyUsage(usage.data.dailyUsage || 0)
        setMonthlyUsage(usage.data.monthlyUsage || 0)
      }
      if (projectsRes?.data) setProjects(projectsRes.data)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const tier = TIER_LIMITS[userTier]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent dark:text-white">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted">
              Pick up where you left off or start new research.
            </p>
          </div>
          <Link href="/research">
            <Button>New Research</Button>
          </Link>
        </div>

        {/* Usage strip */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted">Today</p>
            <p className="mt-1 text-2xl font-bold text-accent dark:text-white">
              {dailyUsage}
              <span className="text-sm font-medium text-muted">/{tier.limit}</span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted">This month</p>
            <p className="mt-1 text-2xl font-bold text-accent dark:text-white">
              {monthlyUsage}
              <span className="text-sm font-medium text-muted">/{tier.limit}</span>
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted">Plan</p>
            <div className="mt-2">
              <Badge variant={userTier === "pro" ? "success" : userTier === "plus" ? "primary" : "default"}>
                {tier.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-accent dark:text-white">
            Recent research
          </h2>

          {loading && <p className="mt-4 text-sm text-muted">Loading…</p>}

          {!loading && projects.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
              <p className="text-sm text-muted">No research yet.</p>
              <p className="mt-1 text-sm text-muted opacity-75">
                Start a new research request to generate your first report.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-4">
            {projects.map((project) => {
              const badge = STATUS_BADGE[project.status] ?? {
                label: project.status ?? "Draft",
                variant: "default" as const,
              }
              return (
                <Link key={project.id} href={`/research/${project.id}`} className="block">
                  <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-sm dark:border-gray-800 dark:bg-zinc-900 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {project.name || "Untitled research"}
                      </h3>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {[
                          project.country?.name,
                          project.committee?.acronym,
                          project.agenda?.title,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "General research"}
                      </p>
                      {project.createdAt && (
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString()} ·{" "}
                          {new Date(project.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}