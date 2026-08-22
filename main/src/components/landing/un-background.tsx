"use client"

import { useScroll, useTransform, motion } from "framer-motion"

export function UnBackground() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -400])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-start justify-center overflow-hidden">
      <motion.div
        style={{ y }}
        className="mt-20 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="h-[600px] w-[600px] opacity-[0.25] blur-[6px] dark:opacity-[0.2]">
          <svg viewBox="0 0 512 512" className="h-full w-full text-[var(--un-logo)]" fill="none">
            <g stroke="currentColor" strokeWidth="1.2">
              <circle cx="256" cy="256" r="150" strokeWidth="1.8" />
              <ellipse cx="256" cy="256" rx="150" ry="120" strokeWidth="0.6" />
              <ellipse cx="256" cy="256" rx="150" ry="75" strokeWidth="0.6" />
              <line x1="106" y1="256" x2="406" y2="256" strokeWidth="0.6" />
              <ellipse cx="256" cy="256" rx="50" ry="150" strokeWidth="0.6" />
              <ellipse cx="256" cy="256" rx="100" ry="150" strokeWidth="0.6" />
              <line x1="256" y1="106" x2="256" y2="406" strokeWidth="0.6" />
            </g>
            <g stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 216 405 Q 140 380 110 300 Q 90 240 110 190" />
              <path d="M 296 405 Q 372 380 402 300 Q 422 240 402 190" />
            </g>
          </svg>
        </div>
      </motion.div>
    </div>
  )
}