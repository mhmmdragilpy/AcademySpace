import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import { ApiResponse } from "../types";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // Check if we are in the browser
    if (typeof window !== "undefined") {
        const session = await getSession();
        if (session && (session as any).accessToken) {
            config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
        }
    }

    // If sending FormData, let axios set the Content-Type automatically
    // This ensures proper boundary for multipart/form-data
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
        // Automatically extract data if the format matches our standard envelope
        if (response.data && response.data.status === 'success') {
            // Return only the data payload for simpler consumption
            // This unwraps { status, data, message } -> data
            return response.data.data as any;
        }
        return response.data;
    },
    (error: AxiosError<ApiResponse<any>>) => {
        const message = error.response?.data?.message || error.message || "An unexpected error occurred";

        // Show toast for errors (only on client)
        if (typeof window !== "undefined") {
            toast.error(message);
        }

        // Handle 401 Unauthorized (optional: redirect to login)
        if (error.response?.status === 401) {
            // Logic to redirect or sign out
            // const { data: session } = useSession(); // Can't use hook here
        }

        return Promise.reject(error);
    }
);

export default api;
