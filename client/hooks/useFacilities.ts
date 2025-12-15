import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Facility, FacilityType } from "@/types";

// Keys
export const facilitiesKeys = {
    all: ['facilities'] as const,
    list: (filters: { search?: string; type?: number | null } = {}) => [...facilitiesKeys.all, 'list', filters] as const,
    detail: (id: string | number) => [...facilitiesKeys.all, 'detail', id] as const,
    types: ['facility-types'] as const,
};

// Hooks

export function useFacilities(filters: { search?: string; type?: number | null } = {}) {
    return useQuery({
        queryKey: facilitiesKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);
            // Add other filters as needed if backend supports them directly, 
            // currently frontend often does filtering too, but good to have prepared.

            const res = await api.get(`/facilities?${params.toString()}`);
            return res as unknown as Facility[];
        }
    });
}

export function useFacility(id: string | number) {
    return useQuery({
        queryKey: facilitiesKeys.detail(id),
        queryFn: async () => {
            const res = await api.get(`/facilities/${id}`);
            return res as unknown as Facility;
        },
        enabled: !!id,
    });
}

export function useFacilityTypes() {
    return useQuery({
        queryKey: facilitiesKeys.types,
        queryFn: async () => {
            const res = await api.get('/facility-types');
            return res as unknown as FacilityType[];
        }
    });
}

export function useDeleteFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/facilities/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilitiesKeys.all });
        }
    });
}

export function useCreateFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<Facility>) => {
            const res = await api.post("/facilities", data);
            return res as unknown as Facility;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilitiesKeys.all });
        }
    });
}

export function useUpdateFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Facility> }) => {
            const res = await api.put(`/facilities/${id}`, data);
            return res as unknown as Facility;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: facilitiesKeys.all });
            queryClient.invalidateQueries({ queryKey: facilitiesKeys.detail(data.facility_id) });
        }
    });
}
