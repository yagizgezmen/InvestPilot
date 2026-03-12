import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { WatchlistProvider } from "@/components/WatchlistProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";
import { MobileNav } from "@/components/ui/MobileNav";

export const metadata: Metadata = {
  title: "InvestPilot",
  description: "Your advanced investment decision and comparison co-pilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 selection:bg-primary/30">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <WatchlistProvider>
              {/* Background Gradients */}
              <div className="fixed inset-0 z-[-1] bg-[#030712] overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
              </div>

              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 w-full">
                  <TopBar />
                  <main className="flex-1 w-full p-4 lg:p-8 relative z-0 flex flex-col">
                    <div className="max-w-[1600px] mx-auto w-full flex flex-col">
                      {children}
                    </div>
                  </main>

                  <footer className="relative w-full border-t border-border/50 py-10 mt-auto overflow-hidden hidden lg:block">
                    <div className="absolute inset-0 bg-secondary/30 backdrop-blur-xl -z-10" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="max-w-5xl mx-auto px-4 text-center">
                      <div className="inline-flex items-center justify-center mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
                        Disclaimer
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Educational purposes only, not financial advice.</p>
                      <p className="mt-2 text-xs font-semibold text-muted-foreground/70">Assumptions: Data provided is mocked/delayed and should not be used for live trading.</p>
                    </div>
                  </footer>

                  <MobileNav />
                </div>
              </div>
            </WatchlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
