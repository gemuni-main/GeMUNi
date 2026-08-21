import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "xl"
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  let classes = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  if (variant === "default") {
    classes += " bg-primary text-primary-foreground hover:bg-primary/90"
  } else if (variant === "primary") {
    classes += " bg-primary text-primary-foreground hover:bg-primary/90"
  } else if (variant === "outline") {
    classes += " border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  } else {
    classes += " bg-transparent py-2 px-4 rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
  }

  if (size === "sm") {
    classes += " h-8 px-3"
  } else if (size === "lg") {
    classes += " h-10 px-8"
  } else {
    classes += " h-10 px-6"
  }

  classes += " shadow-sm"

  return (
    <button className={classes} ref={ref} disabled={props.disabled} {...props}>
      {children}
    </button>
  )
})

Button.displayName = "Button"