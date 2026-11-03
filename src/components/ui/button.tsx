import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs uppercase tracking-[0.18em] font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-6 py-3",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground border border-transparent",
        outline:
          "border border-foreground/40 bg-transparent text-foreground hover:border-foreground hover:bg-surface",
        luxury:
          "border border-accent/60 bg-surface-elevated/80 backdrop-blur-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent",
        ghost:
          "bg-transparent text-foreground hover:bg-surface border border-transparent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-red-800 text-white hover:bg-red-900 border border-transparent",
      },
      size: {
        default: "min-h-[44px] px-6 py-3",
        sm: "min-h-[38px] px-4 py-2 text-[11px]",
        lg: "min-h-[52px] px-8 py-4 text-xs",
        icon: "min-h-[44px] min-w-[44px] p-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

