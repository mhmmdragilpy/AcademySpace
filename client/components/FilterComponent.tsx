"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Users, Building2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FacilityType } from "@/types";

export interface FilterState {
    search: string;
    facilityType: number | null;
    capacityMin: number | null;
    capacityMax: number | null;
    building: string | null;
    availability: "all" | "available" | "maintenance";
}

interface FilterComponentProps {
    onFilterChange: (filters: FilterState) => void;
    facilityTypes: FacilityType[];
    buildings?: string[];
    initialFilters?: Partial<FilterState>;
    showAdvanced?: boolean;
}

const defaultFilters: FilterState = {
    search: "",
    facilityType: null,
    capacityMin: null,
    capacityMax: null,
    building: null,
    availability: "all",
};

export function FilterComponent({
    onFilterChange,
    facilityTypes,
    buildings = [],
    initialFilters = {},
    showAdvanced = true,
}: FilterComponentProps) {
    const [filters, setFilters] = useState<FilterState>({
        ...defaultFilters,
        ...initialFilters,
    });
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== filters.search) {
                const newFilters = { ...filters, search: debouncedSearch };
                setFilters(newFilters);
                onFilterChange(newFilters);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // Update parent when filters change (except search which is debounced)
    const updateFilter = <K extends keyof FilterState>(
        key: K,
        value: FilterState[K]
    ) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (key !== "search") {
            onFilterChange(newFilters);
        }
    };

    const clearFilters = () => {
        setFilters(defaultFilters);
        setDebouncedSearch("");
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters =
        filters.facilityType !== null ||
        filters.capacityMin !== null ||
        filters.capacityMax !== null ||
        filters.building !== null ||
        filters.availability !== "all";

    const activeFilterCount = [
        filters.facilityType !== null,
        filters.capacityMin !== null || filters.capacityMax !== null,
        filters.building !== null,
        filters.availability !== "all",
    ].filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search by name, building..."
                    className="pl-9 pr-12 bg-background h-12 shadow-sm"
                    value={debouncedSearch}
                    onChange={(e) => setDebouncedSearch(e.target.value)}
                />
                {showAdvanced && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {activeFilterCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </div>

            {/* Facility Type Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
                <button
                    onClick={() => updateFilter("facilityType", null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.facilityType === null
                            ? "bg-[#FA7436] text-white shadow-md"
                            : "bg-white text-gray-700 border hover:border-[#FA7436] hover:text-[#FA7436]"
                        }`}
                >
                    All
                </button>
                {facilityTypes.map((type) => (
                    <button
                        key={type.type_id}
                        onClick={() => updateFilter("facilityType", type.type_id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.facilityType === type.type_id
                                ? "bg-[#FA7436] text-white shadow-md"
                                : "bg-white text-gray-700 border hover:border-[#FA7436] hover:text-[#FA7436]"
                            }`}
                    >
                        {type.name}
                    </button>
                ))}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && isAdvancedOpen && (
                <div className="bg-white rounded-xl p-4 shadow-lg border animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm text-gray-700">
                            Advanced Filters
                        </h4>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-xs text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Capacity Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Capacity
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="h-9"
                                    value={filters.capacityMin ?? ""}
                                    onChange={(e) =>
                                        updateFilter(
                                            "capacityMin",
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                />
                                <span className="self-center text-muted-foreground">-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="h-9"
                                    value={filters.capacityMax ?? ""}
                                    onChange={(e) =>
                                        updateFilter(
                                            "capacityMax",
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* Building Filter */}
                        {buildings.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Building
                                </label>
                                <Select
                                    value={filters.building ?? "all"}
                                    onValueChange={(value) =>
                                        updateFilter("building", value === "all" ? null : value)
                                    }
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All Buildings" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Buildings</SelectItem>
                                        {buildings.map((building) => (
                                            <SelectItem key={building} value={building}>
                                                {building}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Availability Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Availability
                            </label>
                            <Select
                                value={filters.availability}
                                onValueChange={(value) =>
                                    updateFilter(
                                        "availability",
                                        value as "all" | "available" | "maintenance"
                                    )
                                }
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available Only</SelectItem>
                                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FilterComponent;
