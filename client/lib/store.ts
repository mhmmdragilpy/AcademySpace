import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    image_url?: string;
}

interface UserStore {
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-storage',
        }
    )
);
