import * as React from "react"
import { cn } from "./Badge"

interface SegmentedControlProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
    className?: string;
}

export function SegmentedControl({ options, selected, onChange, className }: SegmentedControlProps) {
    return (
        <div className={cn("inline-flex bg-secondary/50 p-1 rounded-xl border border-border/50 backdrop-blur-md", className)}>
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={cn(
                        "px-6 py-2.5 min-w-[80px] text-xs font-black rounded-lg transition-all duration-200 transform active:scale-95 flex items-center justify-center",
                        selected === option
                            ? "bg-gradient-to-br from-primary to-accent text-white shadow-md border border-primary/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    )
}
