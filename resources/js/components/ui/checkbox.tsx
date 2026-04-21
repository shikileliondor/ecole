import * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <label className="relative inline-flex">
      <input
        type="checkbox"
        data-slot="checkbox"
        className={cn(
          "peer relative size-4 shrink-0 appearance-none rounded-[4px] border border-input bg-background transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 checked:border-primary checked:bg-primary dark:bg-input/30",
          className
        )}
        {...props}
      />
      <CheckIcon className="pointer-events-none absolute left-1/2 top-1/2 hidden size-3.5 -translate-x-1/2 -translate-y-1/2 text-primary-foreground peer-checked:block" />
    </label>
  )
}

export { Checkbox }
