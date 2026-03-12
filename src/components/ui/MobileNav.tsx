"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutDashboard } from "lucide-react";
import clsx from "clsx";

const TABS = [
    { name: "Market Overview", path: "/", icon: LayoutDashboard },
    { name: "Implementation", path: "/method", icon: Compass },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-card/80 backdrop-blur-xl border-t border-border z-50">
            <div className="flex justify-around items-center h-16 px-2">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className={clsx("h-5 w-5", isActive ? "scale-110" : "scale-100")} />
                            <span className="text-[10px] font-medium">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
