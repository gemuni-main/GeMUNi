import React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    const classes =
      "rounded-xl border border-border bg-card text-card-fg transition-shadow hover:shadow-sm" +
      (className ? ` ${className}` : "")

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"