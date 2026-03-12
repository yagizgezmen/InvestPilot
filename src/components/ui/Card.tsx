import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, glass = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    "rounded-2xl border bg-card text-card-foreground shadow-sm transition-all",
                    glass ? "glass-panel" : "border-border/50",
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={clsx("flex flex-col space-y-2 p-8", className)} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={clsx("text-xl font-bold leading-tight tracking-tight", className)} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={clsx("text-base text-muted-foreground", className)} {...props} />
    )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={clsx("p-8 pt-0", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";
