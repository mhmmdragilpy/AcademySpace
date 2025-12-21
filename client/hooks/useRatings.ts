import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Rating {
    rating: number;
    review: string;
    user_name: string;
    created_at: string;
}

export interface RatingStats {
    averageRating: number;
    totalRatings: number;
}

export interface CreateRatingPayload {
    reservationId: number;
    facilityId: number;
    rating: number;
    review?: string;
}

export const useCreateRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRatingPayload) => {
            const response = await api.post("/ratings", data);
            return response;
        },
        onSuccess: (_, variables) => {
            toast.success("Review submitted successfully!");
            queryClient.invalidateQueries({ queryKey: ["ratings", variables.facilityId] });
            queryClient.invalidateQueries({ queryKey: ["ratingStats", variables.facilityId] });
            queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
        },
        onError: (error: any) => {
            // Error is handled by api interceptor mostly
        }
    });
};

export const useFacilityRatings = (facilityId: number) => {
    return useQuery<Rating[]>({
        queryKey: ["ratings", facilityId],
        queryFn: async () => {
            if (!facilityId) return [];
            const data = await api.get(`/ratings/facility/${facilityId}`);
            return data as unknown as Rating[];
        },
        enabled: !!facilityId,
    });
};

export const useFacilityRatingStats = (facilityId: number) => {
    return useQuery<RatingStats>({
        queryKey: ["ratingStats", facilityId],
        queryFn: async () => {
            if (!facilityId) return { averageRating: 0, totalRatings: 0 };
            const data = await api.get(`/ratings/facility/${facilityId}/average`);
            return data as unknown as RatingStats;
        },
        enabled: !!facilityId,
    });
};

// Check if a specific reservation has been rated by the user
export const useUserReservationRating = (reservationId: number) => {
    return useQuery<Rating | null>({
        queryKey: ["reservationRating", reservationId],
        queryFn: async () => {
            if (!reservationId) return null;
            const data = await api.get(`/ratings/reservation/${reservationId}`);
            return data as unknown as Rating;
        },
        enabled: !!reservationId
    });
}
