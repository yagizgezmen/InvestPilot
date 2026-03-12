"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface WatchlistContextType {
    watchlist: string[];
    toggleWatchlist: (ticker: string) => void;
    isInWatchlist: (ticker: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const useWatchlist = () => {
    const context = useContext(WatchlistContext);
    if (!context) {
        throw new Error("useWatchlist must be used within a WatchlistProvider");
    }
    return context;
};

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    // Initialize from local storage
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("investpilot_watchlist");
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse watchlist", e);
            }
        }
    }, []);

    // Sync to local storage on change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("investpilot_watchlist", JSON.stringify(watchlist));
        }
    }, [watchlist, mounted]);

    const toggleWatchlist = (ticker: string) => {
        setWatchlist(prev =>
            prev.includes(ticker)
                ? prev.filter(t => t !== ticker)
                : [...prev, ticker]
        );
    };

    const isInWatchlist = (ticker: string) => {
        return watchlist.includes(ticker);
    };

    return (
        <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};
