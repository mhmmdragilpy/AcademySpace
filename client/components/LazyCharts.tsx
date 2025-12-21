"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";

// Register Chart.js components
if (typeof window !== 'undefined') {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        LineElement,
        PointElement,
        Title,
        Tooltip,
        Legend,
        ArcElement
    );
}

export const LazyBar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false
});

export const LazyPie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false
});

export const LazyLine = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false
});
