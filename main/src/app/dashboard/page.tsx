"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/scroll-area"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const [userTier, setUserTier] = useState<"free" | "plus" | "pro">("free")
  const [dailyUsage, setDailyUsage] = useState(0)
  const [monthlyUsage, setMonthlyUsage] = useState(0)
  const [projects, setProjects] = useState<any[]>([])
  const [researchItems, setResearchItems] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/v1/account")
      .then((res) => res.json())
      .then((data) => setUserTier(data.data.tier || "free"))
      .catch(() => setUserTier("free"))

    fetch("/api/v1/account/usage")
      .then((res) => res.json())
      .then((data) => {
        setDailyUsage(data.data.dailyUsage || 0)
        setMonthlyUsage(data.data.monthlyUsage || 0)
      })
      .catch(() => {
        setDailyUsage(0)
        setMonthlyUsage(0)
      })

    fetch("/api/v1/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.data || []))
      .catch(() => setProjects([]))

    fetch("/api/v1/research")
      .then((res) => res.json())
      .then((data) => setResearchItems(data.data || []))
      .catch(() => setResearchItems([]))
  }, [])

  const tierInfo = {
    free: {
      label: "Free",
      researchLimit: 5,
      dailyLimit: 1,
      color: "bg-gray-100 text-gray-800",
    },
    plus: {
      label: "Plus",
      researchLimit: 20,
      dailyLimit: 3,
      color: "bg-blue-100 text-blue-800",
    },
    pro: {
      label: "Pro",
      researchLimit: 100,
      dailyLimit: 10,
      color: "bg-green-100 text-green-800",
    },
  }[userTier]

  return (
    <main className="min-h-screen bg-background">
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">
              Welcome to GeMUNi
            </h1>
            <p className="text-muted-foreground">
              Your AI-powered MUN research workspace
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Usage Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Daily Research Use
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Used today
                </span>
                <span className="text-lg font-medium" id="daily-count">
                  {dailyUsage}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex text-xxs font-medium mb-1">
                  <span className="me-2">/{tierInfo?.researchLimit}</span>
                  <span className={tierInfo?.color}>{tierInfo?.label}</span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(dailyUsage / tierInfo?.researchLimit) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Monthly Usage Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Monthly Research Use
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Used this month
                </span>
                <span className="text-lg font-medium">{monthlyUsage}</span>
              </div>
              <div className="mt-3">
                <div className="flex text-xxs font-medium mb-1">
                  <span className="me-2">/{tierInfo?.researchLimit}</span>
                  <span className={tierInfo?.color}>{tierInfo?.label}</span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(monthlyUsage / tierInfo?.researchLimit) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Account Tier Card */}
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Account Tier
              </h3>
              <div className="flex items-center">
                <div
                  className={tierInfo?.color
                    ? `${tierInfo?.color} h-6 w-6 rounded-full flex items-center justify-center mx-3`
                    : "h-6 w-6 rounded-full flex items-center justify-center mx-3"}
                >
                  {tierInfo?.label.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{tierInfo?.label}</p>
                  <p className="text-xs text-muted-foreground">Tier</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Recent Projects
          </h2>
          {projects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No research projects yet.
              </p>
              <p className="mt-4 text-sm">
                Start your first MUN research project from the dashboard.
              </p>
            </Card>
          ) : (
            <ScrollArea>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-5 hover:transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-md flex-shrink-0 flex items-center justify-center"
                      >
                        {project.research_item?.country?.name
                          ? project.research_item.country.name.substring(0, 2)
                              .toUpperCase()
                          : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.research_item?.country?.name} —{" "}
                          {project.research_item?.committee?.acronym}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="mt-6">
            <Button>
              New Research
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}