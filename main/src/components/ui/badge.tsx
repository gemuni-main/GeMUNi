import React from "react"

export interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  children: React.ReactNode
}

const VARIANTS: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  primary: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  success: "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  )
}