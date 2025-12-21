"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, AlertCircle, Plus } from "lucide-react";

import Navigation from "@/components/Navigation";
import { useMyReservations, useCancelReservation } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { RatingDialog } from "@/components/RatingDialog";

export default function ReservationManagementPage() {
    const { data: session } = useSession();
    const [ratingModal, setRatingModal] = useState<{ isOpen: boolean, reservationId: number, facilityId: number, facilityName: string } | null>(null);

    const { data: reservations, isLoading, isError } = useMyReservations();
    const cancelMutation = useCancelReservation();

    const handleCancel = (id: number) => {
        if (confirm("Are you sure you want to cancel this reservation?")) {
            cancelMutation.mutate(id);
        }
    };

    const openRatingModal = (reservation: any) => {
        setRatingModal({
            isOpen: true,
            reservationId: reservation.reservation_id || reservation.id,
            facilityId: reservation.facilityId,
            facilityName: reservation.facilityName || reservation.facility_name
        });
    };

    const closeRatingModal = () => {
        setRatingModal(null);
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status.toUpperCase()) {
            case 'APPROVED': return "default"; // Green (success)
            case 'PENDING': return "secondary"; // Yellow (warning)
            case 'REJECTED': return "destructive"; // Red
            case 'CANCELED': return "outline"; // Gray
            default: return "secondary";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'APPROVED': return "bg-green-100 text-green-800 border-green-200";
            case 'PENDING': return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case 'REJECTED': return "bg-red-100 text-red-800 border-red-200";
            case 'CANCELED': return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const isPast = (dateStr: string, timeStr: string) => {
        // Simple check. Ideally parse properly.
        // dateStr: YYYY-MM-DD, timeStr: HH:MM
        try {
            const endDateTime = new Date(`${dateStr}T${timeStr}`);
            return new Date() > endDateTime;
        } catch (e) {
            return false;
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-muted flex items-center justify-center">
                <Button asChild>
                    <Link href="/login">Please Login</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navigation />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
                        <p className="text-muted-foreground mt-1">Track and manage your facility bookings.</p>
                    </div>
                    <Button asChild>
                        <Link href="/cek-ketersediaan">
                            <Plus className="mr-2 h-4 w-4" /> New Reservation
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                        <CardDescription>A list of your recent reservations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : isError ? (
                            <div className="text-center py-10 text-destructive flex flex-col items-center gap-2">
                                <AlertCircle className="h-8 w-8" />
                                <p>Failed to load reservations.</p>
                            </div>
                        ) : reservations?.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground mb-4">No reservations found.</p>
                                <Button variant="outline" asChild>
                                    <Link href="/cek-ketersediaan">Book your first room</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Facility</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Purpose</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reservations?.map((res) => (
                                            <TableRow key={res.reservation_id || res.id}>
                                                <TableCell className="font-medium">
                                                    {res.facilityName || res.facility_name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{res.date}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {res.startTime || res.start_time} - {res.endTime || res.end_time}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status || '')}`}>
                                                        {res.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={res.purpose}>
                                                    {res.purpose}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    {(res.status?.toUpperCase() === 'PENDING' || res.status?.toUpperCase() === 'APPROVED') && !isPast(res.date || '', res.endTime || res.end_time || '') && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleCancel((res.reservation_id || res.id) as number)}
                                                            disabled={cancelMutation.isPending}
                                                        >
                                                            {cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                                                        </Button>
                                                    )}

                                                    {res.status?.toUpperCase() === 'APPROVED' && isPast(res.date || '', res.endTime || res.end_time || '') && !res.isRated && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                                            onClick={() => openRatingModal(res)}
                                                        >
                                                            Rate
                                                        </Button>
                                                    )}
                                                    {res.isRated && (
                                                        <Badge variant="secondary" className="bg-green-50 text-green-700">Rated</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {ratingModal && (
                    <RatingDialog
                        isOpen={ratingModal.isOpen}
                        onClose={closeRatingModal}
                        reservationId={ratingModal.reservationId}
                        facilityId={ratingModal.facilityId}
                        facilityName={ratingModal.facilityName}
                    />
                )}
            </main>
        </div>
    );
}