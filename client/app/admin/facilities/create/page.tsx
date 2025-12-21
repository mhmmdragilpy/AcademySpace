"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, FacilityType } from "@/types";

export default function CreateFacilityPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        type_id: "",
        building_id: "",
        room_number: "",
        capacity: "",
        floor: "",
        description: "",
        layout_description: "",
        photo_url: "",
        is_active: true,
    });

    // Fetch buildings and facility types
    const { data: buildings } = useQuery({
        queryKey: ["buildings"],
        queryFn: async () => {
            const res = await api.get("/buildings");
            return res as unknown as Building[];
        },
    });

    const { data: facilityTypes } = useQuery({
        queryKey: ["facility-types"],
        queryFn: async () => {
            const res = await api.get("/facility-types");
            return res as unknown as FacilityType[];
        },
    });

    // Handle file upload
    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, JPEG, and PNG images are allowed");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await api.post('/upload', formDataUpload);
            const uploadedUrl = (response as any)?.url || response;

            setFormData(prev => ({ ...prev, photo_url: uploadedUrl }));
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error(error?.response?.data?.message || "Failed to upload image");
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, photo_url: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post("/facilities", data);
        },
        onSuccess: () => {
            toast.success("Facility created successfully");
            router.push("/admin/facilities");
        },
        onError: (error: any) => {
            console.error("Failed to create facility", error);
            toast.error(error?.response?.data?.message || "Failed to create facility");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data - photo_url is optional
        const submitData = {
            name: formData.name,
            type_id: parseInt(formData.type_id),
            building_id: formData.building_id ? parseInt(formData.building_id) : null,
            room_number: formData.room_number || null,
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            floor: formData.floor ? parseInt(formData.floor) : null,
            description: formData.description || null,
            layout_description: formData.layout_description || null,
            photo_url: formData.photo_url || null,
            is_active: formData.is_active,
        };

        createMutation.mutate(submitData);
    };

    return (
        <div className="container mx-auto px-4 max-w-3xl space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/facilities">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Facility</h1>
                    <p className="text-muted-foreground">Add a new facility to the system</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Facility Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Auditorium A"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type_id">
                                    Facility Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    required
                                    value={formData.type_id}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, type_id: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facilityTypes?.map((type) => (
                                            <SelectItem key={type.type_id} value={type.type_id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="building_id">Building</Label>
                                <Select
                                    value={formData.building_id}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, building_id: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings?.map((building) => (
                                            <SelectItem
                                                key={building.building_id}
                                                value={building.building_id.toString()}
                                            >
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="room_number">Room Number</Label>
                                <Input
                                    id="room_number"
                                    value={formData.room_number}
                                    onChange={(e) =>
                                        setFormData({ ...formData, room_number: e.target.value })
                                    }
                                    placeholder="e.g., 101"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capacity: e.target.value })
                                    }
                                    placeholder="e.g., 50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="floor">Floor</Label>
                                <Input
                                    id="floor"
                                    type="number"
                                    value={formData.floor}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, floor: e.target.value })}
                                    placeholder="e.g., 2"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of the facility"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="layout_description">Layout Description</Label>
                            <Textarea
                                id="layout_description"
                                value={formData.layout_description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, layout_description: e.target.value })
                                }
                                placeholder="Description of the facility layout"
                                rows={3}
                            />
                        </div>

                        {/* Photo Upload Section */}
                        <div className="space-y-2">
                            <Label>Facility Photo <span className="text-muted-foreground text-sm">(Optional)</span></Label>

                            {previewUrl || formData.photo_url ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
                                    <Image
                                        src={previewUrl || formData.photo_url}
                                        alt="Facility preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={removeImage}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">Uploading...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 rounded-full bg-muted">
                                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Alternative: Manual URL input */}
                            <div className="flex items-center gap-2 pt-2">
                                <span className="text-xs text-muted-foreground">Or enter URL directly:</span>
                            </div>
                            <Input
                                id="photo_url"
                                type="url"
                                value={formData.photo_url}
                                onChange={(e) => {
                                    setFormData({ ...formData, photo_url: e.target.value });
                                    setPreviewUrl(null);
                                }}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({ ...formData, is_active: checked })
                                }
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Active (available for booking)
                            </Label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={createMutation.isPending || isUploading}>
                                {createMutation.isPending && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                Create Facility
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/facilities">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
