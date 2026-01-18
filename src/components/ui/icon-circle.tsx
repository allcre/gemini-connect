import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconCircleVariants = cva(
  "rounded-full flex items-center justify-center shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "gradient-primary text-primary-foreground",
        match: "gradient-match text-match-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/10 text-destructive",
        ghost: "bg-transparent",
      },
      size: {
        sm: "w-8 h-8 [&_svg]:w-4 [&_svg]:h-4",
        md: "w-10 h-10 [&_svg]:w-5 [&_svg]:h-5",
        lg: "w-14 h-14 [&_svg]:w-6 [&_svg]:h-6",
        xl: "w-20 h-20 [&_svg]:w-10 [&_svg]:h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconCircleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconCircleVariants> {}

const IconCircle = React.forwardRef<HTMLDivElement, IconCircleProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(iconCircleVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
IconCircle.displayName = "IconCircle";

export { IconCircle, iconCircleVariants };
