"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
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

        // Prepare data
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

                        <div className="space-y-2">
                            <Label htmlFor="photo_url">Photo URL</Label>
                            <Input
                                id="photo_url"
                                type="url"
                                value={formData.photo_url}
                                onChange={(e) =>
                                    setFormData({ ...formData, photo_url: e.target.value })
                                }
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
                            <Button type="submit" disabled={createMutation.isPending}>
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
