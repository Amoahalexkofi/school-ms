import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[14px] text-slate-900 transition-all outline-none",
        "placeholder:text-slate-400",
        "focus-visible:border-indigo-400 focus-visible:ring-3 focus-visible:ring-indigo-500/15",
        "hover:border-slate-300",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
        "aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-500/15",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700",
        className
      )}
      {...props}
    />
  )
}

export { Input }
