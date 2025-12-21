"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/types";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        role: "user",
        profile_picture_url: "",

    });

    // Fetch user data
    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const res = await api.get(`/users/${userId}`);
            return res as unknown as User;
        },
    });

    // Populate form when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || "",
                full_name: user.full_name || "",
                role: user.role || "user",
                profile_picture_url: user.profile_picture_url || "",

            });
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.put(`/users/${userId}`, data);
        },
        onSuccess: () => {
            toast.success("User updated successfully");
            router.push("/admin/users");
        },
        onError: (error: any) => {
            console.error("Failed to update user", error);
            toast.error(error?.response?.data?.message || "Failed to update user");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data - only include password if it's not empty
        const submitData: any = {
            username: formData.username,
            full_name: formData.full_name,
            role: formData.role,
            profile_picture_url: formData.profile_picture_url || null,
        };



        updateMutation.mutate(submitData);
    };

    if (isLoadingUser) {
        return (
            <div className="container mx-auto px-4 max-w-2xl space-y-6">
                <Skeleton className="h-12 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">Update user account information</p>
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
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="e.g., john_doe"
                            />
                            <p className="text-xs text-muted-foreground">
                                Only letters, numbers, and underscores (3-30 characters)
                            </p>
                        </div>

                        {/* Password update removed as per policy: Admins cannot change user passwords */}

                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Role <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
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
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Update User
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
