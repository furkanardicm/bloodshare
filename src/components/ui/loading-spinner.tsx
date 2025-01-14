'use client';

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  centered?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12"
};

export function LoadingSpinner({ 
  size = "md", 
  className,
  centered = false 
}: LoadingSpinnerProps) {
  const Wrapper = centered ? CenteredWrapper : Fragment;

  return (
    <Wrapper>
      <Loader2 
        className={cn(
          "animate-spin text-red-600",
          sizeClasses[size],
          className
        )} 
      />
    </Wrapper>
  );
}

function CenteredWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      {children}
    </div>
  );
} 