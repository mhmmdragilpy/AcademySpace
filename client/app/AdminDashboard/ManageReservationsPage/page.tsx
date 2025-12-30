// USE CASE #9: Menyetujui atau Menolak Reservasi - [View]
// USE CASE #10: Melihat Detail Reservasi - [View]
// USE CASE #14: Melihat Jadwal Reservasi - [View]
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, isSameDay } from "date-fns";
import { List, Calendar as CalendarIcon, Check, X, FileText, Eye, ExternalLink, Clock, Users, LayoutGrid } from "lucide-react";
import { CalendarViewComponent, CalendarReservation } from "@/components/CalendarViewComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

export default function AdminReservationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    reservationId: number | null;
    action: 'approved' | 'rejected' | null;
    facilityName: string;
    userName: string;
  }>({
    isOpen: false,
    reservationId: null,
    action: null,
    facilityName: '',
    userName: '',
  });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const res = await api.get("/reservations");
      return (res as any) || [];
    },
    enabled: !!session?.accessToken,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/reservations/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success("Reservation status updated");
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      setSelectedReservation(null);
    },
    onError: (error) => {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  });

  // Open confirmation dialog
  const openConfirmDialog = (reservation: any, action: 'approved' | 'rejected') => {
    setConfirmAction({
      isOpen: true,
      reservationId: reservation.id,
      action,
      facilityName: reservation.facilityName || reservation.facility_name || 'Unknown',
      userName: reservation.userName || reservation.user_name || 'Unknown',
    });
  };

  // Handle confirmed action
  // [USE CASE #9] Menyetujui atau Menolak Reservasi - Admin Action
  const handleConfirmedAction = () => {
    if (confirmAction.reservationId && confirmAction.action) {
      statusMutation.mutate({
        id: confirmAction.reservationId,
        status: confirmAction.action
      });
    }
    setConfirmAction({ isOpen: false, reservationId: null, action: null, facilityName: '', userName: '' });
  };

  // Cancel confirmation
  const cancelConfirmAction = () => {
    setConfirmAction({ isOpen: false, reservationId: null, action: null, facilityName: '', userName: '' });
  };

  const handleStatusUpdate = (id: number, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const filteredReservations = reservations.filter((res: any) => {
    if (filterStatus !== "All" && res.status?.toUpperCase() !== filterStatus.toUpperCase()) return false;
    return true;
  });

  const calendarReservations = filteredReservations.filter((res: any) => {
    if (selectedDate) {
      return isSameDay(new Date(res.date), selectedDate);
    }
    return false;
  });

  const bookedDays = reservations.map((res: any) => new Date(res.date));

  // Color-coded status badge
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return "bg-green-100 text-green-800 border-green-200";
      case 'PENDING': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'REJECTED': return "bg-red-100 text-red-800 border-red-200";
      case 'CANCELED': return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>;
      case 'PENDING': return <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>;
      case 'REJECTED': return <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>;
      default: return <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>;
    }
  };

  // Document Preview Component
  const DocumentPreview = ({ url }: { url: string | null }) => {
    if (!url) return <span className="text-gray-400 text-sm">No document</span>;

    // Get base URL by removing '/api' from the API URL
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/api$/, "");
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    const isPdf = /\.pdf$/i.test(url);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            View Document
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isImage ? (
              <img src={fullUrl} alt="Proposal Document" className="w-full h-auto rounded-lg" />
            ) : isPdf ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                <p className="text-gray-600 mb-4">PDF document ready for viewing</p>
                <div className="flex gap-3 justify-center">
                  <Button asChild>
                    <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open PDF in New Tab
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={fullUrl} download>
                      Download PDF
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                <Button asChild>
                  <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Reservation Detail Modal
  const ReservationDetailModal = ({ reservation }: { reservation: any }) => {
    if (!reservation) return null;

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/api$/, "");
    const fullUrl = reservation.proposalUrl?.startsWith('http')
      ? reservation.proposalUrl
      : reservation.proposalUrl
        ? `${baseUrl}${reservation.proposalUrl}`
        : null;

    return (
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Reservation Detail
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                {reservation.status}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p className="font-semibold">{reservation.userName}</p>
                <p className="text-sm text-gray-500">@{reservation.userUsername}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Facility</label>
                <p className="font-semibold">{reservation.facilityName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="font-semibold">{reservation.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Time</label>
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {reservation.startTime} - {reservation.endTime}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Participants</label>
                <p className="font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {reservation.participants} orang
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Purpose</label>
              <p className="bg-gray-50 p-3 rounded-lg mt-1">{reservation.purpose}</p>
            </div>

            {/* Document Preview Section */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">Supporting Document</label>
              {fullUrl ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Document Uploaded</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={fullUrl} download>
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                  No document uploaded
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {reservation.status?.toUpperCase() === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedReservation(null);
                    openConfirmDialog(reservation, 'approved');
                  }}
                  disabled={statusMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Reservation
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setSelectedReservation(null);
                    openConfirmDialog(reservation, 'rejected');
                  }}
                  disabled={statusMutation.isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Reservation
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Reservations</h1>
          <p className="text-muted-foreground">View and manage all reservations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reservations</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Pending">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>Pending</span>
                </SelectItem>
                <SelectItem value="Approved">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Approved</span>
                </SelectItem>
                <SelectItem value="Rejected">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Rejected</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="list">
                <List className="w-4 h-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Date View
              </TabsTrigger>
              <TabsTrigger value="fullcalendar">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Full Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              {isLoading ? (
                <div className="text-center py-12">Loading reservations...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Facility</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Document</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {filteredReservations.map((res: any) => (
                        <tr key={res.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedReservation(res)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{res.userName || res.user_name}</div>
                            <div className="text-sm text-muted-foreground">@{res.userUsername}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{res.facilityName || res.facility_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{res.date}</div>
                            <div className="text-sm text-muted-foreground">{res.startTime} - {res.endTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                              {getStatusIcon(res.status)}
                              {res.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <DocumentPreview url={res.proposalUrl} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                            {res.status?.toUpperCase() === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => openConfirmDialog(res, 'approved')}
                                  disabled={statusMutation.isPending}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => openConfirmDialog(res, 'rejected')}
                                  disabled={statusMutation.isPending}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="bg-white border rounded-lg p-4 flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{ booked: bookedDays }}
                    modifiersStyles={{
                      booked: { fontWeight: 'bold', textDecoration: 'underline', color: '#2563eb' }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-4">
                    Reservations for {selectedDate ? format(selectedDate, 'PPP') : 'Selected Date'}
                  </h3>
                  {calendarReservations.length === 0 ? (
                    <p className="text-muted-foreground italic">No reservations for this date.</p>
                  ) : (
                    <div className="space-y-4">
                      {calendarReservations.map((res: any) => (
                        <div
                          key={res.id}
                          className="border rounded-lg p-4 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => setSelectedReservation(res)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{res.facilityName}</div>
                              <div className="text-sm text-muted-foreground">{res.startTime} - {res.endTime}</div>
                              <div className="text-sm text-muted-foreground mt-1">User: {res.userName}</div>
                              <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}>
                                  {getStatusIcon(res.status)}
                                  {res.status}
                                </span>
                              </div>
                              {res.proposalUrl && (
                                <div className="mt-2">
                                  <DocumentPreview url={res.proposalUrl} />
                                </div>
                              )}
                            </div>
                            {res.status?.toUpperCase() === 'PENDING' && (
                              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => openConfirmDialog(res, 'approved')}>
                                  <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => openConfirmDialog(res, 'rejected')}>
                                  <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fullcalendar" className="mt-6">
              <CalendarViewComponent
                reservations={filteredReservations.map((res: any): CalendarReservation => ({
                  id: res.id,
                  facilityId: res.facilityId,
                  facilityName: res.facilityName || res.facility_name || "Unknown",
                  date: res.date,
                  startTime: res.startTime || res.start_time || "",
                  endTime: res.endTime || res.end_time || "",
                  purpose: res.purpose || "",
                  status: res.status || "PENDING",
                  userName: res.userName || res.user_name,
                  attendees: res.participants || res.attendees,
                }))}
                onReservationClick={(reservation) => {
                  const fullRes = filteredReservations.find((r: any) => r.id === reservation.id);
                  if (fullRes) setSelectedReservation(fullRes);
                }}
                view="month"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ReservationDetailModal reservation={selectedReservation} />

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction.isOpen} onOpenChange={(open) => !open && cancelConfirmAction()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction.action === 'approved' ? 'Approve Reservation?' : 'Reject Reservation?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.action === 'approved' ? (
                <>
                  Anda akan <span className="font-semibold text-green-600">menyetujui</span> reservasi dari{' '}
                  <span className="font-semibold">{confirmAction.userName}</span> untuk{' '}
                  <span className="font-semibold">{confirmAction.facilityName}</span>.
                  <br /><br />
                  User akan menerima notifikasi bahwa reservasi mereka telah disetujui.
                </>
              ) : (
                <>
                  Anda akan <span className="font-semibold text-red-600">menolak</span> reservasi dari{' '}
                  <span className="font-semibold">{confirmAction.userName}</span> untuk{' '}
                  <span className="font-semibold">{confirmAction.facilityName}</span>.
                  <br /><br />
                  User akan menerima notifikasi bahwa reservasi mereka ditolak.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelConfirmAction}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={confirmAction.action === 'approved'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {confirmAction.action === 'approved' ? (
                <><Check className="w-4 h-4 mr-2" /> Ya, Approve</>
              ) : (
                <><X className="w-4 h-4 mr-2" /> Ya, Reject</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}