"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface DemoTourProps {
  onClose: () => void
}

const SLIDES = [
  { id: "tour", label: "Quick Tour" },
  { id: "example", label: "Example Report" },
  { id: "mockup", label: "Full Mockup" },
]

const FEATURES = [
  {
    title: "Verified Sources",
    desc: "Access data from UN, WHO, Amnesty International, HRW, and 50+ trusted organizations.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "AI Summaries",
    desc: "Every paragraph includes clickable citations back to the original source.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Committee-Specific",
    desc: "Reports tailored to your country, committee, and agenda — ready for position papers.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M3 17h9m-5 0l-4 4m4-4h10m-5 0l4 4" />
      </svg>
    ),
  },
]

const EXAMPLE_SECTIONS = [
  {
    title: "Executive Summary",
    content:
      "**Executive Summary**\n\nThe United Nations Security Council (UNSC) has been actively engaged in addressing the pressing issue of preventing the proliferation of nuclear weapons to non-nuclear nations. This agenda is particularly relevant in the context of Afghanistan, a country that has faced significant security challenges and instability in recent years.\n\n**Key Findings:**\n- Afghanistan strongly supports the NPT and the IAEA's verification mechanisms\n- Regional stability requires coordinated non-proliferation efforts\n- Economic development and nuclear security must be balanced\n- International cooperation is essential for effective implementation",
  },
  {
    title: "Country Position",
    content:
      '**Country Position**\n\nAs a non-nuclear nation, Afghanistan is deeply committed to the Treaty on the Non-Proliferation of Nuclear Weapons (NPT) and advocates for:\n\n- **Strengthening International Frameworks**: Full implementation of UNSCR 1540 to prevent non-state actors from accessing WMD materials\n- **Regional Cooperation**: Working with neighbors through SAARC and bilateral channels to establish nuclear-free zones\n- **Disarmament Advocacy**: Supporting nuclear-weapon states in fulfilling their disarmament obligations under Article VI of the NPT\n\n> "Afghanistan believes that nuclear disarmament and non-proliferation are mutually reinforcing goals essential for international peace and security."',
  },
  {
    title: "Speaking Points",
    content:
      "**Suggested Speaking Points**\n\n• Our delegation reaffirms commitment to the NPT as the cornerstone of the global non-proliferation regime\n• We call on all states to implement UNSCR 1540 and prevent non-state actors from accessing nuclear materials\n• Regional stability requires transparent nuclear policies and confidence-building measures among neighboring states\n• Afghanistan supports the establishment of a Middle East Nuclear-Weapon-Free Zone\n• We urge nuclear-weapon states to accelerate disarmament commitments",
  },
  {
    title: "Possible Solutions",
    content:
      "**Proposed Solutions**\n\n1. **Strengthen IAEA Safeguards** — Enhance verification mechanisms and increase funding for nuclear security\n2. **Regional Dialogue Framework** — Establish a South Asian non-proliferation dialogue platform under UN auspices\n3. **Nuclear Security Training** — Provide capacity-building programs for non-nuclear states to secure vulnerable materials\n4. **Export Control Harmonization** — Align national export control regimes with international standards (NSG, MTCR)\n5. **Counter-Nuclear Terrorism** — Develop joint task forces for preventing nuclear terrorism through intelligence sharing",
  },
]

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ArrowLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function ChatIconSmall() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function SlideTour() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent dark:text-white">How GeMUNi Works</h2>
        <p className="mt-2 text-muted">Three things that make your research powerful</p>
      </div>
      <div className="grid gap-4">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary dark:bg-primary-900/40">
              {f.icon}
            </div>
            <div>
              <h3 className="font-semibold text-accent dark:text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideExample() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent dark:text-white">Example Research Report</h2>
        <p className="mt-2 text-muted">Afghanistan · UNSC · Prevention of Nuclear Proliferation</p>
      </div>
      <div className="max-h-[400px] overflow-y-auto rounded-xl border border-border bg-card p-6">
        <div className="prose prose-sm max-w-none">
          {EXAMPLE_SECTIONS.map((s, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-base font-semibold text-accent dark:text-white">
                {i + 1}. {s.title}
              </h3>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.content}</ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideMockup() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent dark:text-white">Full Report Experience</h2>
        <p className="mt-2 text-muted">Report content with an AI chat assistant on the side</p>
      </div>
      <div className="grid grid-cols-5 gap-4 rounded-xl border border-border bg-card p-4">
        <div className="col-span-3 space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              Research Report
            </span>
            <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-[10px] font-medium text-accent dark:bg-gray-800 dark:text-gray-300">
              UNSC
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-4 space-y-1.5">
              <div className="h-2.5 w-full rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2.5 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2.5 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2.5 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="h-2.5 w-full rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2.5 w-11/12 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2.5 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-2.5 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        </div>
        <div className="col-span-2 flex flex-col overflow-hidden rounded-lg border border-border">
          <div className="flex items-center gap-2 bg-accent px-3 py-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-white">
              <ChatIconSmall />
            </div>
            <div>
              <p className="text-xs font-medium text-white">AI Chat</p>
              <p className="text-[10px] text-white/60">Ask anything</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 bg-gray-50 p-3 dark:bg-gray-900">
            <div className="flex gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary dark:bg-primary-900/40">
                <ChatIconSmall />
              </div>
              <div className="max-w-[85%] rounded-xl bg-white px-3 py-2 text-[11px] leading-relaxed dark:bg-gray-800 dark:text-gray-200">
                What are the main counterarguments to Afghanistan&apos;s position on nuclear
                non-proliferation?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-xl bg-accent px-3 py-2 text-[11px] text-white">
                Pakistan may argue that nuclear weapons are essential for strategic balance in South
                Asia...
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary dark:bg-primary-900/40">
                <ChatIconSmall />
              </div>
              <div className="max-w-[85%] rounded-xl bg-white px-3 py-2 text-[11px] leading-relaxed dark:bg-gray-800 dark:text-gray-200">
                Counter: A nuclear arms race would divert resources from development...
              </div>
            </div>
          </div>
          <div className="border-t border-border p-2">
            <div className="h-7 rounded-md border border-border bg-white dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DemoTour({ onClose }: DemoTourProps) {
  const [current, setCurrent] = useState(0)

  function handleBack() {
    setCurrent((p) => Math.max(0, p - 1))
  }

  function handleNext() {
    if (current < SLIDES.length - 1) {
      setCurrent((p) => p + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <AnimatePresence mode="wait">
        <motion.div
          key={SLIDES[current].id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl bg-background p-8 shadow-xl"
        >
          <button
            onClick={onClose}
            aria-label="Close demo"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-gray-100 hover:text-accent dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <CloseIcon />
          </button>

          {current === 0 && <SlideTour />}
          {current === 1 && <SlideExample />}
          {current === 2 && <SlideMockup />}

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    i === current ? "bg-accent dark:bg-primary" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {current > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:text-accent dark:hover:text-white"
                >
                  <ArrowLeft />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-600"
              >
                {current < SLIDES.length - 1 ? (
                  <>
                    Next <ArrowRight />
                  </>
                ) : (
                  "Got it"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}