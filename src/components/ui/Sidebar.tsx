"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Compass, LineChart, Sparkles, LayoutDashboard, Settings, ChevronRight } from "lucide-react";
import clsx from "clsx";

const TABS = [
    { name: "Market", path: "/", icon: LayoutDashboard },
    { name: "Implementation", path: "/method", icon: Compass },
    { name: "Invest", path: "/opportunities", icon: Sparkles },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null) setIsCollapsed(saved === "true");
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("sidebar-collapsed", String(newState));
    };

    if (!isMounted) return <aside className="hidden lg:flex w-[280px] flex-col bg-card/50 backdrop-blur-3xl border-r border-border h-screen sticky top-0 left-0 pt-8 z-40" />;

    return (
        <aside
            className={clsx(
                "hidden lg:flex flex-col bg-card/50 backdrop-blur-3xl border-r border-border h-screen sticky top-0 left-0 pt-8 z-40 transition-all duration-500 ease-in-out group/sidebar",
                isCollapsed ? "w-[90px] min-w-[90px]" : "w-[280px] min-w-[280px]"
            )}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={clsx(
                    "absolute -right-4 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-2 shadow-lg shadow-primary/20 hover:scale-110 transition-all duration-300 z-50 border border-white/10 group-hover/sidebar:opacity-100 opacity-0 lg:opacity-100 flex items-center justify-center",
                    isCollapsed ? "rotate-0" : "rotate-180"
                )}
            >
                <ChevronRight className="h-4 w-4" />
            </button>

            <div className={clsx("px-6 mb-12 flex items-center transition-all duration-500", isCollapsed ? "justify-center" : "gap-4 px-10")}>
                <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-2.5 shadow-xl shadow-primary/20 ring-1 ring-white/10 shrink-0">
                    <LineChart className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                    <span className="font-black text-2xl tracking-tighter text-foreground whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">
                        Invest<span className="text-primary">Pilot</span>
                    </span>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-3 mt-4 overflow-x-hidden">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.path;
                    return (
                        <Link
                            key={tab.path}
                            href={tab.path}
                            className={clsx(
                                "flex items-center rounded-2xl text-base font-bold transition-all duration-300 group relative w-full overflow-hidden whitespace-nowrap",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-[0_4px_12px_rgba(59,130,246,0.12)]"
                                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                                isCollapsed ? "justify-center px-0 h-16" : "px-8 py-4 gap-5 h-auto"
                            )}
                        >
                            {/* Active Accent Indicator */}
                            <div className={clsx(
                                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full transition-all duration-500 shadow-[2px_0_12px_rgba(59,130,246,0.5)]",
                                isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                            )} />

                            <tab.icon className={clsx(
                                "h-6 w-6 shrink-0 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:scale-110 group-hover:text-primary"
                            )} />

                            {!isCollapsed && (
                                <span className="tracking-tight leading-none animate-in fade-in slide-in-from-left-2 duration-300">
                                    {tab.name}
                                </span>
                            )}

                            {/* Hover Backdrop Effect (Subtle) */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className={clsx("p-6 mt-auto border-t border-border/50 transition-all duration-500", isCollapsed ? "flex justify-center" : "")}>
                <button
                    className={clsx(
                        "flex items-center rounded-2xl text-base font-bold text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all group active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 whitespace-nowrap",
                        isCollapsed ? "justify-center px-0 h-16 w-full" : "px-8 py-4 gap-5 w-full"
                    )}
                >
                    <Settings className="h-6 w-6 shrink-0 group-hover:rotate-45 transition-transform duration-500" />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Settings</span>}
                </button>
            </div>
        </aside>
    );
}
