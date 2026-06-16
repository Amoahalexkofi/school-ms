import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-[0_1px_6px_rgba(99,102,241,0.35)]",
        outline:
          "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900",
        destructive:
          "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300",
        link: "text-indigo-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-1.5 px-3.5 text-[13px]",
        xs:      "h-6 gap-1 rounded-lg px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm:      "h-7 gap-1 rounded-lg px-2.5 text-[12px] [&_svg:not([class*='size-'])]:size-3.5",
        lg:      "h-11 gap-2 px-5 text-[14px]",
        xl:      "h-12 gap-2 px-6 text-[15px] rounded-2xl",
        icon:    "size-9",
        "icon-xs":   "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":   "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg":   "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
