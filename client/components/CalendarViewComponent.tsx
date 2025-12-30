"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface CalendarReservation {
    id: number;
    facilityId?: number;
    facilityName: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    status: string;
    userName?: string;
    attendees?: number;
}

export interface CalendarFacility {
    id: number;
    name: string;
}

interface CalendarViewComponentProps {
    reservations: CalendarReservation[];
    facilities?: CalendarFacility[];
    onReservationClick?: (reservation: CalendarReservation) => void;
    view?: "month" | "week" | "day";
    initialDate?: Date;
    className?: string;
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAYS_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
        case "APPROVED":
            return "bg-green-500";
        case "PENDING":
            return "bg-yellow-500";
        case "REJECTED":
            return "bg-red-500";
        case "CANCELED":
            return "bg-gray-400";
        default:
            return "bg-blue-500";
    }
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toUpperCase()) {
        case "APPROVED":
            return "default";
        case "PENDING":
            return "secondary";
        case "REJECTED":
        case "CANCELED":
            return "destructive";
        default:
            return "outline";
    }
};

export function CalendarViewComponent({
    reservations,
    facilities = [],
    onReservationClick,
    view: initialView = "month",
    initialDate = new Date(),
    className = "",
}: CalendarViewComponentProps) {
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [view, setView] = useState(initialView);
    const [selectedFacility, setSelectedFacility] = useState<string>("all");
    const [selectedReservation, setSelectedReservation] = useState<CalendarReservation | null>(null);

    // Filter reservations by facility
    const filteredReservations = useMemo(() => {
        if (selectedFacility === "all") return reservations;
        return reservations.filter(
            (r) => r.facilityId?.toString() === selectedFacility || r.facilityName === selectedFacility
        );
    }, [reservations, selectedFacility]);

    // Get reservations for a specific date
    const getReservationsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return filteredReservations.filter((r) => r.date === dateStr);
    };

    // Calendar navigation
    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const navigateWeek = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction * 7);
        setCurrentDate(newDate);
    };

    const navigateDay = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const navigate = (direction: number) => {
        if (view === "month") navigateMonth(direction);
        else if (view === "week") navigateWeek(direction);
        else navigateDay(direction);
    };

    const goToToday = () => setCurrentDate(new Date());

    // Get calendar data for month view
    const getMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        // Add padding for days before the month starts
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    // Get week data
    const getWeekData = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    };

    const handleReservationClick = (reservation: CalendarReservation) => {
        if (onReservationClick) {
            onReservationClick(reservation);
        } else {
            setSelectedReservation(reservation);
        }
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Render Month View
    const renderMonthView = () => {
        const monthData = getMonthData();

        return (
            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center font-medium text-sm text-gray-600 py-2 border-b"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar cells */}
                {monthData.map((date, index) => {
                    const reservationsForDay = date ? getReservationsForDate(date) : [];
                    const isCurrentDay = isToday(date);

                    return (
                        <div
                            key={index}
                            className={`min-h-[100px] p-1 border border-gray-100 ${date ? "bg-white" : "bg-gray-50"
                                } ${isCurrentDay ? "ring-2 ring-[#FA7436] ring-inset" : ""}`}
                        >
                            {date && (
                                <>
                                    <div
                                        className={`text-sm font-medium mb-1 ${isCurrentDay
                                                ? "text-[#FA7436]"
                                                : date.getDay() === 0
                                                    ? "text-red-500"
                                                    : "text-gray-700"
                                            }`}
                                    >
                                        {date.getDate()}
                                    </div>
                                    <div className="space-y-1">
                                        {reservationsForDay.slice(0, 3).map((reservation) => (
                                            <div
                                                key={reservation.id}
                                                onClick={() => handleReservationClick(reservation)}
                                                className={`text-xs p-1 rounded cursor-pointer truncate text-white ${getStatusColor(
                                                    reservation.status
                                                )} hover:opacity-80 transition-opacity`}
                                                title={`${reservation.facilityName} - ${reservation.startTime}`}
                                            >
                                                {reservation.startTime.slice(0, 5)} {reservation.facilityName}
                                            </div>
                                        ))}
                                        {reservationsForDay.length > 3 && (
                                            <div className="text-xs text-gray-500 text-center">
                                                +{reservationsForDay.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render Week View
    const renderWeekView = () => {
        const weekData = getWeekData();
        const hours = Array.from({ length: 17 }, (_, i) => i + 5); // 05:00 - 21:00

        return (
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-8 border-b">
                        <div className="p-2 text-center text-sm font-medium text-gray-600">
                            Jam
                        </div>
                        {weekData.map((date, index) => (
                            <div
                                key={index}
                                className={`p-2 text-center border-l ${isToday(date) ? "bg-[#FA7436]/10" : ""
                                    }`}
                            >
                                <div className="text-sm font-medium text-gray-600">
                                    {DAYS[date.getDay()]}
                                </div>
                                <div
                                    className={`text-lg font-bold ${isToday(date) ? "text-[#FA7436]" : "text-gray-900"
                                        }`}
                                >
                                    {date.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time slots */}
                    {hours.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 border-b">
                            <div className="p-2 text-center text-sm text-gray-500 border-r">
                                {hour.toString().padStart(2, "0")}:00
                            </div>
                            {weekData.map((date, dayIndex) => {
                                const dayReservations = getReservationsForDate(date);
                                const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                                const matchingReservations = dayReservations.filter(
                                    (r) => r.startTime <= hourStr && r.endTime > hourStr
                                );

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`p-1 min-h-[50px] border-l ${isToday(date) ? "bg-[#FA7436]/5" : ""
                                            }`}
                                    >
                                        {matchingReservations.map((reservation) => (
                                            <div
                                                key={reservation.id}
                                                onClick={() => handleReservationClick(reservation)}
                                                className={`text-xs p-1 rounded cursor-pointer truncate text-white ${getStatusColor(
                                                    reservation.status
                                                )} hover:opacity-80 transition-opacity mb-1`}
                                            >
                                                {reservation.facilityName}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render Day View
    const renderDayView = () => {
        const hours = Array.from({ length: 17 }, (_, i) => i + 5);
        const dayReservations = getReservationsForDate(currentDate);

        return (
            <div className="space-y-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                        {DAYS_FULL[currentDate.getDay()]}, {currentDate.getDate()}{" "}
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </div>
                </div>

                <div className="space-y-1">
                    {hours.map((hour) => {
                        const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                        const matchingReservations = dayReservations.filter(
                            (r) => r.startTime <= hourStr && r.endTime > hourStr
                        );

                        return (
                            <div key={hour} className="flex border-b">
                                <div className="w-20 p-2 text-sm text-gray-500 flex-shrink-0">
                                    {hourStr}
                                </div>
                                <div className="flex-1 p-2 min-h-[60px] flex flex-wrap gap-2">
                                    {matchingReservations.map((reservation) => (
                                        <div
                                            key={reservation.id}
                                            onClick={() => handleReservationClick(reservation)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-white ${getStatusColor(
                                                reservation.status
                                            )} hover:opacity-80 transition-opacity`}
                                        >
                                            <span className="font-medium">{reservation.facilityName}</span>
                                            <span className="text-sm opacity-80">
                                                {reservation.startTime} - {reservation.endTime}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getTitle = () => {
        if (view === "month") {
            return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (view === "week") {
            const weekData = getWeekData();
            const start = weekData[0];
            const end = weekData[6];
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()} - ${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
            }
            return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
        } else {
            return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#FA7436]" />
                        Jadwal Reservasi
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                        {/* Facility Filter */}
                        {facilities.length > 0 && (
                            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Fasilitas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Fasilitas</SelectItem>
                                    {facilities.map((facility) => (
                                        <SelectItem key={facility.id} value={facility.id.toString()}>
                                            {facility.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* View Selector */}
                        <Select value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Bulan</SelectItem>
                                <SelectItem value="week">Minggu</SelectItem>
                                <SelectItem value="day">Hari</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            Hari Ini
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>

                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span>Approved</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-yellow-500"></div>
                            <span>Pending</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-red-500"></div>
                            <span>Rejected</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {view === "month" && renderMonthView()}
                {view === "week" && renderWeekView()}
                {view === "day" && renderDayView()}
            </CardContent>

            {/* Reservation Detail Dialog */}
            <Dialog
                open={!!selectedReservation}
                onOpenChange={() => setSelectedReservation(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detail Reservasi</DialogTitle>
                    </DialogHeader>
                    {selectedReservation && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{selectedReservation.facilityName}</span>
                                <Badge variant={getStatusBadgeVariant(selectedReservation.status)}>
                                    {selectedReservation.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{selectedReservation.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>
                                        {selectedReservation.startTime} - {selectedReservation.endTime}
                                    </span>
                                </div>
                                {selectedReservation.userName && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{selectedReservation.userName}</span>
                                    </div>
                                )}
                                {selectedReservation.attendees && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{selectedReservation.attendees} peserta</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="text-sm font-medium text-gray-500 mb-1">Keperluan</div>
                                <p className="text-sm">{selectedReservation.purpose}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default CalendarViewComponent;
