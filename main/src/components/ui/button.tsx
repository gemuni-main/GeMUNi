import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "xl"
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-accent text-white hover:bg-accent-700",
  secondary: "bg-primary text-white hover:bg-primary-600",
  outline:
    "border border-gray-200 bg-card text-accent hover:bg-gray-50 dark:border-gray-600 dark:text-foreground dark:hover:bg-gray-800",
  ghost:
    "text-accent hover:bg-gray-100 dark:text-foreground dark:hover:bg-gray-800",
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  default: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-12 px-8 text-base",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const classes = [
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:pointer-events-none",
      VARIANT_CLASSES[variant],
      SIZE_CLASSES[size],
      className,
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"