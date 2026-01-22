import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/shared/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Trading-specific variants
        profit: "border-transparent bg-profit text-profit-foreground shadow",
        loss: "border-transparent bg-loss text-loss-foreground shadow",
        pending: "border-transparent bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        filled: "border-transparent bg-profit/10 text-profit",
        rejected: "border-transparent bg-loss/10 text-loss",
        paper: "border-transparent bg-green-500/10 text-green-700 dark:text-green-400",
        live: "border-transparent bg-orange-500/10 text-orange-700 dark:text-orange-400 glow-orange",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
