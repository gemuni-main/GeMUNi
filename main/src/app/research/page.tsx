"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ReliabilityTier } from "@/types/shared"

type WizardStep = "country" | "committee" | "agenda" | "config" | "generate"

interface Country {
  id: string
  name: string
  isoCode: string
  flagEmoji: string
}

interface Committee {
  id: string
  name: string
  acronym: string
  description: string
}

interface Agenda {
  id: string
  title: string
  description: string
}

interface ResearchConfig {
  depth: "brief" | "standard" | "deep"
  focusAreas: string[]
  includeHistoricalContext: boolean
  includeCurrentDevelopments: boolean
  includeDiplomaticPosition: boolean
  includeStatistics: boolean
  includeProposedSolutions: boolean
  includePolicyOptions: boolean
}

export default function ResearchWizard() {
  const [step, setStep] = useState<WizardStep>("country")
  const [country, setCountry] = useState<Country | null>(null)
  const [committee, setCommittee] = useState<Committee | null>(null)
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [config, setConfig] = useState<ResearchConfig>({
    depth: "standard",
    focusAreas: [],
    includeHistoricalContext: true,
    includeCurrentDevelopments: true,
    includeDiplomaticPosition: true,
    includeStatistics: true,
    includeProposedSolutions: true,
    includePolicyOptions: true,
  })

  const countries: Country[] = [
    { id: "1", name: "United States", isoCode: "US", flagEmoji: "🇺🇸" },
    { id: "2", name: "United Kingdom", isoCode: "UK", flagEmoji: "🇬🇧" },
    { id: "3", name: "China", isoCode: "CN", flagEmoji: "🇨🇳" },
    { id: "4", name: "Russia", isoCode: "RU", flagEmoji: "🇷🇺" },
    { id: "5", name: "France", isoCode: "FR", flagEmoji: "🇫🇷" },
    { id: "6", name: "Germany", isoCode: "DE", flagEmoji: "🇩🇪" },
    { id: "7", name: "Japan", isoCode: "JP", flagEmoji: "🇯🇵" },
    { id: "8", name: "Brazil", isoCode: "BR", flagEmoji: "🇧🇷" },
    { id: "9", name: "India", isoCode: "IN", flagEmoji: "🇮🇳" },
    { id: "10", name: "Canada", isoCode: "CA", flagEmoji: "🇨🇦" },
  ]

  const committees: Committee[] = [
    { id: "1", name: "Security Council", acronym: "UNSC", description: "Maintain international peace and security" },
    { id: "2", name: "General Assembly", acronym: "UNGA", description: "Deliberative body of all UN member states" },
    { id: "3", name: "Human Rights Council", acronym: "UNHRC", description: "Promote and protect human rights globally" },
    { id: "4", name: "World Health Organization", acronym: "WHO", description: "Directing and coordinating authority for international health" },
    { id: "5", name: "UN Environment Programme", acronym: "UNEP", description: "Environmental issues at global level" },
  ]

  const agendas: Agenda[] = [
    { id: "1", title: "Climate Migration", description: "Managing migration driven by climate change" },
    { id: "2", title: "Digital Privacy", description: "Protecting privacy in the digital age" },
    { id: "3", title: "Water Scarcity", description: "Addressing global water scarcity and management" },
    { id: "4", title: "Arms Control", description: "Regulating conventional and unconventional weapons" },
  ]

  const nextStep = (current: WizardStep) => {
    const steps: WizardStep[] = ["country", "committee", "agenda", "config", "generate"]
    const currentIndex = steps.indexOf(current)
    setStep(steps[currentIndex + 1] || "generate")
  }

  const prevStep = (current: WizardStep) => {
    const steps: WizardStep[] = ["country", "committee", "agenda", "config", "generate"]
    const currentIndex = steps.indexOf(current)
    setStep(steps[currentIndex - 1] || "country")
  }

  const handleGenerate = async () => {
    if (!country || !committee || !agenda) return
    setStep("generate")
  }

  const stepNumbers: Record<WizardStep, number> = {
    country: 1,
    committee: 2,
    agenda: 3,
    config: 4,
    generate: 5,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-navy">Research Wizard</h2>
          <span className="text-sm text-muted-foreground">
            Step {stepNumbers[step]}/5
          </span>
        </div>

        <div className="flex gap-2 mb-8">
          <div className={`w-24 h-2 rounded-full bg-muted ${step === "country" || step === "generate" ? "bg-primary" : ""} transition-colors`}></div>
          <div className={`w-24 h-2 rounded-full bg-muted ${step === "committee" ? "bg-primary" : ""} transition-colors`}></div>
          <div className={`w-24 h-2 rounded-full bg-muted ${step === "agenda" ? "bg-primary" : ""} transition-colors`}></div>
          <div className={`w-24 h-2 rounded-full bg-muted ${step === "config" ? "bg-primary" : ""} transition-colors`}></div>
          <div className={`w-24 h-2 rounded-full bg-primary transition-colors`}></div>
        </div>

        {step === "country" && (
          <div>
            <h3 className="text-lg font-medium mb-6">Select Your Country</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {countries.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCountry(c)}
                  className={`p-4 border rounded-lg text-center transition-colors ${country?.id === c.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                >
                  <span className="text-2xl block mb-1">{c.flagEmoji}</span>
                  <span className="text-sm">{c.name}</span>
                </button>
              ))}
            </div>
            <Button onClick={() => nextStep("country")} className="mt-4" disabled={!country}>
              Continue
            </Button>
          </div>
        )}

        {step === "committee" && (
          <div>
            <h3 className="text-lg font-medium mb-6">Select Committee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {committees.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCommittee(c)}
                  className={`p-4 border rounded-lg transition-colors text-left ${committee?.id === c.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                >
                  <div className="font-medium">{c.name} <span className="text-muted-foreground">({c.acronym})</span></div>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                </button>
              ))}
            </div>
            <Button onClick={() => nextStep("committee")} className="mt-4" disabled={!committee}>
              Continue
            </Button>
          </div>
        )}

        {step === "agenda" && (
          <div>
            <h3 className="text-lg font-medium mb-6">Select Agenda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {agendas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAgenda(a)}
                  className={`p-4 border rounded-lg transition-colors text-left ${agenda?.id === a.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
                >
                  <div className="font-medium">{a.title}</div>
                  <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                </button>
              ))}
            </div>
            <Button onClick={() => nextStep("agenda")} className="mt-4" disabled={!agenda}>
              Continue
            </Button>
          </div>
        )}

        {step === "config" && (
          <div>
            <h3 className="text-lg font-medium mb-6">Research Configuration</h3>
            <Card className="p-4 mb-4">
              <h4 className="font-medium mb-3">Report Depth</h4>
              <select
                className="block w-full rounded-md border p-2"
                value={config.depth}
                onChange={(e) => setConfig((prev) => ({ ...prev, depth: e.target.value as "brief" | "standard" | "deep" }))}
              >
                <option value="brief">Brief (short)</option>
                <option value="standard">Standard (recommended)</option>
                <option value="deep">Deep (comprehensive)</option>
              </select>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Focus Areas</h4>
              <Input
                placeholder="e.g. human rights, economy, environment"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-2">
                Areas of focus for the research report
              </p>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium mb-3">Report Sections</h4>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span>Historical Context</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span>Current Developments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span>Diplomatic Position</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span>Statistics</span>
                </label>
              </div>
            </Card>
          </div>
        )}

        {step === "generate" && (
          <div>
            <h3 className="text-lg font-medium mb-6">Research Confirmation</h3>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-medium">Country</p>
                  <p className="text-muted-foreground">{country?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Committee</p>
                  <p className="text-muted-foreground">{committee?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Agenda</p>
                  <p className="text-muted-foreground">{agenda?.title}</p>
                </div>
                <div>
                  <p className="font-medium">Depth</p>
                  <p className="text-muted-foreground">{config.depth}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                The AI will generate a source-backed research report tailored to your
                country, committee, and agenda. Every claim will be traced to verified
                sources.
              </p>
            </Card>
            <Button onClick={handleGenerate} className="w-full">
              Generate Research
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}