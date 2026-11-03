import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-foreground",
        blossom: "border-accent/40 bg-secondary/40 text-foreground",
        sage: "border-sage/50 bg-sage/20 text-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        warning: "border-amber-600/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        success: "border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

