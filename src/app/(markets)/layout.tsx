"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LineChart, DollarSign, Activity, TrendingUp } from "lucide-react";

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const links = [
        { href: "/crypto", label: "Crypto", icon: <LineChart className="h-5 w-5" />, color: "text-primary" },
        { href: "/us-stocks", label: "US Stocks", icon: <Activity className="h-5 w-5" />, color: "text-blue-500" },
        { href: "/tr-stocks", label: "TR Stocks", icon: <TrendingUp className="h-5 w-5" />, color: "text-red-500" },
        { href: "/precious-metals", label: "Precious Metals", icon: <DollarSign className="h-5 w-5" />, color: "text-amber-500" },
    ];

    return (
        <div className="w-full flex justify-center flex-col items-center">
            {/* Markets Navigation Bar */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 mt-6">
                <div className="flex flex-wrap gap-6 items-center justify-center sm:justify-start">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "group flex items-center justify-center gap-4 px-12 py-7 rounded-[2rem] transition-all duration-500 border relative overflow-hidden min-w-[240px]",
                                    isActive
                                        ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary/20"
                                        : "bg-secondary/40 border-border/40 hover:bg-secondary/60 hover:border-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                                )}
                            >
                                <div className={clsx(
                                    "p-2.5 rounded-xl transition-all duration-500",
                                    isActive ? "bg-primary/20 shadow-inner" : "bg-background/40 group-hover:scale-110",
                                    link.color
                                )}>
                                    {link.icon}
                                </div>
                                <span className={clsx(
                                    "text-base font-black tracking-tight transition-colors whitespace-nowrap",
                                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Page Content */}
            <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
}
