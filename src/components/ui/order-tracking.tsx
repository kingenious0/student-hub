"use client"

import * as React from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OrderTrackingProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: { name: string; timestamp: string; isCompleted: boolean }[]
}

const OrderTracking = React.forwardRef<HTMLDivElement, OrderTrackingProps>(
  ({ steps = [], className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full max-w-md", className)} {...props}>
        {steps.length > 0 ? (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex">
                <div className="flex flex-col items-center">
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 shrink-0 text-muted-foreground/50" />
                  )}
                  {index < steps.length - 1 && (
                    <div
                      className={cn("w-[2px] grow min-h-[1.5rem] my-1", {
                        "bg-primary": steps[index + 1].isCompleted,
                        "bg-muted-foreground/20": !steps[index + 1].isCompleted,
                      })}
                    />
                  )}
                </div>
                <div className="ml-4 pb-2">
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-wider",
                      step.isCompleted ? "text-foreground" : "text-foreground/30"
                    )}
                  >
                    {step.name}
                  </p>
                  {step.timestamp && (
                    <p className="text-[10px] font-mono text-foreground/40 mt-0.5">
                      {step.timestamp}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
)
OrderTracking.displayName = "OrderTracking"

export { OrderTracking }
