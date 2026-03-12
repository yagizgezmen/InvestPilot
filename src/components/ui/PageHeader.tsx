import React from "react";
import clsx from "clsx";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, subtitle, actions, breadcrumbs, className }: PageHeaderProps) {
    return (
        <div className={clsx("flex flex-col gap-6 md:flex-row md:items-end justify-between mb-10 px-8 pb-8 border-b border-border/50", className)}>
            <div className="space-y-1">
                {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
                {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
    );
}
