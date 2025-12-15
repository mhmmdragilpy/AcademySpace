import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "@/types";

// Keys
export const userKeys = {
    all: ['users'] as const,
    list: (filters: { search?: string } = {}) => [...userKeys.all, 'list', filters] as const,
    detail: (id: string | number) => [...userKeys.all, 'detail', id] as const,
};

// Hooks
export function useUsers(filters: { search?: string } = {}) {
    return useQuery({
        queryKey: userKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.append("search", filters.search);

            const res = await api.get(`/users?${params.toString()}`);
            return res as unknown as User[];
        }
    });
}

export function useUser(id: string | number) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const res = await api.get(`/users/${id}`);
            return res as unknown as User;
        },
        enabled: !!id,
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        }
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: Partial<User> & { password?: string }) => {
            const res = await api.post("/users", data);
            return res as unknown as User;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        }
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
            const res = await api.put(`/users/${id}`, data);
            return res as unknown as User;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(data.user_id) });
        }
    });
}
