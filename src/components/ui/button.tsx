import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary Actions
        default: "rounded-xl bg-button-dark text-button-dark-foreground shadow-soft hover:shadow-elevated hover:opacity-90 transition-opacity",
        secondary: "rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
        outline: "rounded-xl border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",

        // Semantic Actions
        destructive: "rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft",
        success: "rounded-xl gradient-success text-success-foreground shadow-soft hover:shadow-elevated hover:brightness-110",
        match: "rounded-xl gradient-match text-match-foreground shadow-soft hover:shadow-elevated hover:brightness-110",
        accent: "rounded-xl bg-accent text-accent-foreground shadow-soft hover:shadow-elevated hover:opacity-90 transition-opacity",

        // Special States
        ghost: "rounded-xl hover:bg-accent/50 hover:text-accent-foreground",
        link: "rounded-xl text-primary underline-offset-4 hover:underline",

        // Component-Specific
        glass: "rounded-xl glass border border-border/50 text-foreground hover:bg-card/90 shadow-soft",
        icon: "rounded-full bg-card shadow-card hover:shadow-elevated hover:bg-secondary",
      },
      size: {
        sm: "h-9 rounded-lg px-4 text-sm",
        default: "h-11 px-6 py-2",
        lg: "h-12 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-full",
        "icon-lg": "h-14 w-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
