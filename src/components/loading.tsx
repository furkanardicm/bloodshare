import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  centered?: boolean
}

export function LoadingSpinner({ 
  size = "md", 
  centered = true, 
  className,
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        centered && "min-h-[200px]",
        className
      )}
      {...props}
    >
      <Loader2 
        className={cn(
          "animate-spin text-muted-foreground",
          sizeClasses[size]
        )} 
      />
    </div>
  )
} 