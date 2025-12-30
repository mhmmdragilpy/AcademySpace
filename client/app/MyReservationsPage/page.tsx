// USE CASE #8: Mengedit atau Membatalkan Reservasi - [View]
// USE CASE #12: Melihat Riwayat Reservasi - [View]
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";



export default function ReservationManagementPage() {
    const { data: session } = useSession();


    // Cancel confirmation state
    const [cancelConfirm, setCancelConfirm] = useState<{
        isOpen: boolean;
        reservationId: number | null;
        facilityName: string;
    }>({ isOpen: false, reservationId: null, facilityName: '' });

    const { data: reservations, isLoading, isError } = useMyReservations();
    const cancelMutation = useCancelReservation();

    const openCancelConfirm = (reservation: any) => {
        setCancelConfirm({
            isOpen: true,
            reservationId: reservation.reservation_id || reservation.id,
            facilityName: reservation.facilityName || reservation.facility_name,
        });
    };

    // [USE CASE #8] Mengedit atau Membatalkan Reservasi - User Cancel Reservasi
    const handleConfirmedCancel = () => {
        if (cancelConfirm.reservationId) {
            cancelMutation.mutate(cancelConfirm.reservationId);
        }
        setCancelConfirm({ isOpen: false, reservationId: null, facilityName: '' });
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
                    <Link href="/LoginPage">Please Login</Link>
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
                        <Link href="/CheckAvailabilityPage">
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
                                    <Link href="/CheckAvailabilityPage">Book your first room</Link>
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
                                                        <>
                                                            {res.status?.toUpperCase() === 'PENDING' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link href={`/EditReservationPage/${res.reservation_id || res.id}`}>
                                                                        Edit
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => openCancelConfirm(res)}
                                                                disabled={cancelMutation.isPending}
                                                            >
                                                                {cancelMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel"}
                                                            </Button>
                                                        </>
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



                {/* Cancel Confirmation Dialog */}
                <AlertDialog open={cancelConfirm.isOpen} onOpenChange={(open) => !open && setCancelConfirm({ isOpen: false, reservationId: null, facilityName: '' })}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Batalkan Reservasi?
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    Anda akan <span className="font-semibold text-red-600">membatalkan</span> reservasi untuk{' '}
                                    <span className="font-semibold">"{cancelConfirm.facilityName}"</span>.
                                    <br /><br />
                                    <span className="text-amber-600">⚠️ Tindakan ini tidak dapat dibatalkan.</span>
                                    <br />
                                    Slot waktu akan tersedia kembali untuk user lain.
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Kembali</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmedCancel}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Ya, Batalkan Reservasi
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}