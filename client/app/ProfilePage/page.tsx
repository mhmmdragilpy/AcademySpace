// USE CASE #3: Mengelola Profil - [View]
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Pencil, Trash2, Eye, X, Loader2, User, AtSign, Lock, Shield, Camera, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
    fullName: string;
    username: string;
    role: string;
    password: string;
    avatar: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();

    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [userData, setUserData] = useState<UserData>({
        fullName: "",
        username: "",
        role: "User",
        password: "",
        avatar: "",
    });

    const [editingField, setEditingField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [deleteAvatarConfirm, setDeleteAvatarConfirm] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/LoginPage");
            return;
        }

        if (status === "authenticated") {
            fetchUserProfile();
        }
    }, [status, router]);

    // [USE CASE #3] Mengelola Profil - Fetch Data Profil
    const fetchUserProfile = async () => {
        try {
            const profile = (await api.get("/users/profile")) as any;
            setUserData({
                fullName: profile.full_name || "User Name",
                username: profile.username || "username",
                role: profile.role || "user",
                password: "",
                avatar: profile.profile_picture_url || "",
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast.error("Failed to load profile");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Uploading profile picture...");

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const updatedUser = (await api.put("/users/profile/avatar", formData)) as any;
            const newAvatarUrl = updatedUser.profile_picture_url;

            if (!newAvatarUrl) {
                throw new Error("No profile_picture_url in response");
            }

            setUserData((prev) => ({
                ...prev,
                avatar: newAvatarUrl,
            }));

            await update({ user: { image: newAvatarUrl } });
            // Force a refresh to update all components (like Navigation) with new avatar
            router.refresh();
            toast.success("Profile picture updated successfully!", { id: toastId });
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload image", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setDeleteAvatarConfirm(false);

        setIsUploading(true);
        const toastId = toast.loading("Removing profile picture...");

        try {
            await api.delete("/users/profile/avatar");

            setUserData((prev) => ({ ...prev, avatar: "" }));
            await update({ user: { image: null } });
            // Force a refresh to update all components (like Navigation) with removed avatar
            router.refresh();

            toast.success("Profile picture removed successfully!", { id: toastId });
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete image", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (field: string, value: string) => {
        setEditingField(field);
        setTempValue(value);
    };

    const handleCancel = () => {
        setEditingField(null);
        setTempValue("");
    };

    // [USE CASE #3] Mengelola Profil - Simpan Perubahan Profil
    const handleSave = async (field: string) => {
        if (!tempValue.trim()) {
            toast.error("Value cannot be empty");
            setEditingField(null);
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Updating profile...");

        try {
            const updatePayload: any = {};

            if (field === "fullName") {
                updatePayload.full_name = tempValue;
            } else if (field === "username") {
                if (tempValue.length < 3 || tempValue.length > 30) {
                    toast.error("Username harus 3-30 karakter", { id: toastId });
                    setIsUploading(false);
                    return;
                }
                if (!/^[a-z0-9_]+$/.test(tempValue)) {
                    toast.error("Username hanya boleh huruf kecil, angka, dan underscore", { id: toastId });
                    setIsUploading(false);
                    return;
                }
                updatePayload.username = tempValue;
            } else if (field === "password") {
                if (tempValue.length < 6) {
                    toast.error("Password must be at least 6 characters", { id: toastId });
                    setIsUploading(false);
                    return;
                }
                updatePayload.password = tempValue;
            }

            const updatedUser = (await api.put("/users/profile", updatePayload)) as any;

            const updatedData = { ...userData };
            if (field === "fullName") {
                updatedData.fullName = updatedUser.full_name;
                await update({ user: { name: updatedUser.full_name } });
            } else if (field === "username") {
                updatedData.username = updatedUser.username;
            } else if (field === "password") {
                updatedData.password = "";
            }

            setUserData(updatedData);
            setEditingField(null);
            // Refresh to update all components with the new data
            if (field === "fullName") {
                router.refresh();
            }
            toast.success("Profile updated successfully!", { id: toastId });
        } catch (error: any) {
            console.error("Update failed", error);
            toast.error(error?.response?.data?.message || "Failed to update profile", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    if (status === "loading" || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navigation />

            <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
                {/* Header Card */}
                <Card className="mb-8 border-none shadow-lg overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-[#08294B] via-[#0a3d6b] to-[#08294B] relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FA7436]/20 to-transparent" />
                    </div>

                    <CardContent className="pb-6">
                        {/* Avatar Section */}
                        <div className="relative -mt-20 ml-6 mb-6">
                            <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl group">
                                {userData.avatar ? (
                                    <Image
                                        key={userData.avatar}
                                        src={userData.avatar}
                                        alt="Profile Avatar"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        onError={() => {
                                            setUserData((prev) => ({ ...prev, avatar: "" }));
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-[#0a3d6b] text-white">
                                        <span className="text-4xl font-bold">{userData.fullName?.charAt(0) || "U"}</span>
                                    </div>
                                )}

                                {/* Loading Overlay */}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                                    </div>
                                )}

                                {/* Hover Actions */}
                                {!isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        {userData.avatar && (
                                            <button
                                                onClick={() => setViewingImage(userData.avatar)}
                                                className="p-2 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 text-white transition-all"
                                                title="View full size"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => document.getElementById("avatar-upload")?.click()}
                                            className="p-2 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 text-white transition-all"
                                            title="Upload new photo"
                                        >
                                            <Camera size={18} />
                                        </button>
                                        {userData.avatar && (
                                            <button
                                                onClick={() => setDeleteAvatarConfirm(true)}
                                                className="p-2 bg-red-500/80 backdrop-blur-sm rounded-full hover:bg-red-600 text-white transition-all"
                                                title="Remove photo"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* User Info */}
                        <div className="ml-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{userData.fullName}</h1>
                            <div className="flex items-center gap-3 text-gray-600">
                                <span className="flex items-center gap-1">
                                    <AtSign size={16} />
                                    @{userData.username}
                                </span>
                                <Badge variant="secondary" className="bg-[#FA7436]/10 text-[#FA7436] border-[#FA7436]/20">
                                    <Shield size={14} className="mr-1" />
                                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Settings */}
                <Card className="shadow-lg border-none">
                    <CardHeader>
                        <CardTitle className="text-2xl">Profile Settings</CardTitle>
                        <CardDescription>Update your personal information and account settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                                <User size={16} className="text-gray-500" />
                                Full Name
                            </Label>
                            {editingField === "fullName" ? (
                                <div className="flex gap-2">
                                    <Input
                                        id="fullName"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSave("fullName");
                                            if (e.key === "Escape") handleCancel();
                                        }}
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <Button onClick={() => handleSave("fullName")} size="icon" className="bg-green-600 hover:bg-green-700">
                                        <Check size={18} />
                                    </Button>
                                    <Button onClick={handleCancel} size="icon" variant="outline">
                                        <X size={18} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors">
                                    <span className="text-gray-900 font-medium">{userData.fullName}</span>
                                    <Button
                                        onClick={() => handleEdit("fullName", userData.fullName)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-primary"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Username - Editable */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                                <AtSign size={16} className="text-gray-500" />
                                Username
                            </Label>
                            {editingField === "username" ? (
                                <div className="flex gap-2">
                                    <Input
                                        id="username"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSave("username");
                                            if (e.key === "Escape") handleCancel();
                                        }}
                                        className="flex-1"
                                        autoFocus
                                        placeholder="3-30 karakter, huruf, angka, underscore"
                                    />
                                    <Button onClick={() => handleSave("username")} size="icon" className="bg-green-600 hover:bg-green-700">
                                        <Check size={18} />
                                    </Button>
                                    <Button onClick={handleCancel} size="icon" variant="outline">
                                        <X size={18} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors">
                                    <span className="text-gray-900 font-medium">@{userData.username}</span>
                                    <Button
                                        onClick={() => handleEdit("username", userData.username)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-primary"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">Username harus 3-30 karakter, hanya huruf, angka, dan underscore (_)</p>
                        </div>

                        {/* Role - Read Only */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm font-medium">
                                <Shield size={16} className="text-gray-500" />
                                Role
                            </Label>
                            <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
                                <span className="text-gray-700 font-medium capitalize">{userData.role}</span>
                                <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                                <Lock size={16} className="text-gray-500" />
                                Password
                            </Label>
                            {editingField === "password" ? (
                                <div className="flex gap-2">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter new password (min 6 characters)"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSave("password");
                                            if (e.key === "Escape") handleCancel();
                                        }}
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <Button onClick={() => handleSave("password")} size="icon" className="bg-green-600 hover:bg-green-700">
                                        <Check size={18} />
                                    </Button>
                                    <Button onClick={handleCancel} size="icon" variant="outline">
                                        <X size={18} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors">
                                    <span className="text-gray-900 font-medium">{"•".repeat(12)}</span>
                                    <Button
                                        onClick={() => handleEdit("password", userData.password)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:text-primary"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Image Viewer Modal */}
            {viewingImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingImage(null)}
                >
                    <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingImage(null)}
                            className="absolute -top-14 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <div className="relative w-full h-full">
                            <Image src={viewingImage} alt="Profile Full View" fill className="object-contain" />
                        </div>
                    </div>
                </div>
            )}

            <Footer />

            {/* Delete Avatar Confirmation Dialog */}
            <AlertDialog open={deleteAvatarConfirm} onOpenChange={setDeleteAvatarConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" />
                            Hapus Foto Profil?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda yakin ingin menghapus foto profil?
                            <br />
                            Foto akan dihapus dan diganti dengan avatar default.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAvatar}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
