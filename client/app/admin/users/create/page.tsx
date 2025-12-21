"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function CreateUserPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        full_name: "",
        role: "user",
        profile_picture_url: "",
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post("/users", data);
        },
        onSuccess: () => {
            toast.success("User created successfully");
            router.push("/admin/users");
        },
        onError: (error: any) => {
            console.error("Failed to create user", error);
            toast.error(error?.response?.data?.message || "Failed to create user");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data
        const submitData = {
            username: formData.username,
            password: formData.password,
            full_name: formData.full_name,
            role: formData.role,
            profile_picture_url: formData.profile_picture_url || null,
        };

        createMutation.mutate(submitData);
    };

    return (
        <div className="container mx-auto px-4 max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/users">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
                    <p className="text-muted-foreground">Add a new user account to the system</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">
                                Full Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="full_name"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Username <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="e.g., john_doe"
                                pattern="[a-zA-Z0-9_]{3,30}"
                                title="Username must be 3-30 characters and contain only letters, numbers, and underscores"
                            />
                            <p className="text-xs text-muted-foreground">
                                3-30 characters, letters, numbers, and underscores only.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Minimum 6 characters"
                            />
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 6 characters long
                            </p>
                        </div>

                        {/* Role selection removed - Admin can only create 'user' role accounts */}

                        <div className="space-y-2">
                            <Label htmlFor="profile_picture_url">Profile Picture URL (Optional)</Label>
                            <Input
                                id="profile_picture_url"
                                type="url"
                                value={formData.profile_picture_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, profile_picture_url: e.target.value })
                                }
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Create User
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/users">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
