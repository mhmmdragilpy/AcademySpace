import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Reservation } from "@/types";
import { useSession } from "next-auth/react";

// Keys
export const reservationKeys = {
    all: ['reservations'] as const,
    my: ['my-reservations'] as const,
    admin: ['admin-reservations'] as const,
    detail: (id: number) => [...reservationKeys.all, 'detail', id] as const,
};

// Hooks

export function useMyReservations() {
    const { data: session } = useSession();

    return useQuery({
        queryKey: reservationKeys.my,
        queryFn: async () => {
            const res = await api.get("/reservations/my");
            return res as unknown as Reservation[];
        },
        enabled: !!session?.accessToken, // Only fetch if authenticated
    });
}

export function useAdminReservations() {
    const { data: session } = useSession();
    // Add role check if needed, but API protects it too

    return useQuery({
        queryKey: reservationKeys.admin,
        queryFn: async () => {
            const res = await api.get("/reservations"); // Admin endpoint usually returns all
            return res as unknown as Reservation[];
        },
        enabled: !!session?.accessToken,
    });
}

export function useCancelReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/reservations/${id}`);
        },
        onSuccess: () => {
            // Invalidate both lists
            queryClient.invalidateQueries({ queryKey: reservationKeys.my });
            queryClient.invalidateQueries({ queryKey: reservationKeys.admin });
        }
    });
}

// Example for Create
export function useCreateReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => { // Type more strictly if possible
            const res = await api.post("/reservations", data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: reservationKeys.my });
        }
    });
}
