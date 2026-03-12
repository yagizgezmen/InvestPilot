"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            <div className={clsx(
                "fixed inset-y-0 right-0 z-50 w-full md:w-[400px] lg:w-[500px] bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </>
    );
}
