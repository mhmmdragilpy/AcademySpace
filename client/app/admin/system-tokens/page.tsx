"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Key, Copy, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SystemTokensPage() {
    const { data: session } = useSession();

    const { data: tokens, isLoading, isError } = useQuery({
        queryKey: ['system-tokens'],
        queryFn: async () => {
            const res = await api.get("/dashboard/tokens");
            // api interceptor usually returns response.data or response directly. 
            // Logic in dashboard page suggests mixed return. 
            // We'll try to handle basic structure
            if ((res as any).ADMIN_REG_TOKEN) return res;
            return (res as any).data || res;
        },
        enabled: !!session?.user, // Assuming session.user exists
    });

    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard.`);
    };

    if (isLoading) {
        return <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-32 w-full" />
        </div>;
    }

    if (isError) {
        return <div className="p-8 text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Failed to load system tokens.</span>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Tokens</h1>
                <p className="text-muted-foreground">Manage global system tokens for registration and recovery.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            Admin Registration Token
                        </CardTitle>
                        <CardDescription>
                            Required for creating new Admin accounts. Keep this secret.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg font-mono text-lg break-all">
                            {tokens?.ADMIN_REG_TOKEN || "Not Found"}
                        </div>
                        <Button
                            className="mt-4 w-full"
                            variant="outline"
                            onClick={() => copyToClipboard(tokens?.ADMIN_REG_TOKEN, "Admin Token")}
                        >
                            <Copy className="mr-2 h-4 w-4" /> Copy Token
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            Password Reset Master Token
                        </CardTitle>
                        <CardDescription>
                            Used to validate password reset requests without email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg font-mono text-lg break-all">
                            {tokens?.RESET_PASS_TOKEN || "Not Found"}
                        </div>
                        <Button
                            className="mt-4 w-full"
                            variant="outline"
                            onClick={() => copyToClipboard(tokens?.RESET_PASS_TOKEN, "Reset Token")}
                        >
                            <Copy className="mr-2 h-4 w-4" /> Copy Token
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
