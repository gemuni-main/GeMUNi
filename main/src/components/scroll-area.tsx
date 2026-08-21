import React from "react"

export const ScrollArea = React.forwardRef<HTMLDivElement, {
  className?: string
  children?: React.ReactNode
}>(({ className, children, ...props }, ref) => {
  const classes = "flex-1 min-h-[200px] overflow-auto rounded-md border p-4" + (className ? ` ${className}` : "")

  return (
    <div className={classes} ref={ref} {...props}>
      {children}
    </div>
  )
})

ScrollArea.displayName = "ScrollArea"