import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border border-border/80 bg-card text-card-foreground shadow-soft",
        editorial:
          "rounded-3xl border border-border/90 bg-gradient-to-b from-card to-secondary/30 shadow-soft",
        interactive:
          "card-interactive border border-border/80 bg-card shadow-soft hover:shadow-lift",
        rose:
          "border border-rose/50 bg-rose/40 text-foreground dark:bg-rose/25 dark:border-rose/30 shadow-soft",
        sage:
          "border border-sage/50 bg-sage/40 text-foreground dark:bg-sage/25 dark:border-sage/30 shadow-soft",
        sky:
          "border border-sky/50 bg-sky/40 text-foreground dark:bg-sky/25 dark:border-sky/30 shadow-soft",
        gold:
          "border border-gold/50 bg-gold/30 text-foreground dark:bg-gold/20 dark:border-gold/30 shadow-soft",
        wine:
          "rounded-3xl border border-primary/30 bg-gradient-to-br from-primary-deep to-primary text-primary-foreground shadow-lift",
        glass:
          "glass-card border border-border/70 text-card-foreground shadow-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-serif font-bold leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
