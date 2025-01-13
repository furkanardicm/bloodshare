import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  
  const variants = {
    default: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        "h-10 py-2 px-4",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
