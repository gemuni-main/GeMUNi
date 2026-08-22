"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link href="/research" className="text-sm text-muted hover:text-accent dark:hover:text-white">
            New Research
          </Link>
          <Link href="/dashboard" className="text-sm text-muted hover:text-accent dark:hover:text-white">
            Dashboard
          </Link>
          <div className="border-l border-border pl-3">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}