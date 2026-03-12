"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Search, Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function TopBar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-30 w-full flex items-center justify-between px-10 h-20 bg-background/60 backdrop-blur-xl border-b border-border/50">
            {/* Mobile Title (Hidden on desktop since Sidebar has it) */}
            <div className="lg:hidden flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-foreground">
                    Invest<span className="text-primary">Pilot</span>
                </span>
            </div>

            {/* Search Input (Desktop mainly) */}
            <div className="hidden lg:flex items-center flex-1 max-w-md relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search instruments, news, or strategies..."
                    className="w-full bg-secondary/50 border border-border/50 rounded-full py-2 !pl-14 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="relative p-2 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"></span>
                </button>

                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all active:scale-95"
                        aria-label="Toggle Dark Mode"
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                )}

                {/* User Avatar Placeholder */}
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-border/50 cursor-pointer shadow-sm ml-2"></div>
            </div>
        </header>
    );
}
