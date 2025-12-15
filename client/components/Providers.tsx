"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    // Create a client - strict singleton pattern with useState
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light" // Default to light for clean look
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster position="top-center" richColors />
                </ThemeProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
