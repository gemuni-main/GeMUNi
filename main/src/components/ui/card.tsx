import React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
  const classes = "rounded-lg border border-bg bg-card p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  const finalClasses = classes + (className ? ` ${className}` : "")

  return (
    <div className={finalClasses} ref={ref} {...props}>
      {children}
    </div>
  )
})

Card.displayName = "Card"