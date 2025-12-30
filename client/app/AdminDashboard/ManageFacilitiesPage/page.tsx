// USE CASE #13: Mengelola Fasilitas - [View]
"use client";

import { useState } from "react";
import { useFacilities, useDeleteFacility } from "@/hooks/useFacilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Facility } from "@/types";
import { Plus, Edit, Trash2, Wrench, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

type ConfirmActionType = 'delete' | 'setMaintenance' | 'clearMaintenance' | null;

export default function AdminFacilitiesPage() {
  const { data: facilities, isLoading, error } = useFacilities({ includeInactive: true });
  const deleteMutation = useDeleteFacility();
  const queryClient = useQueryClient();

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: ConfirmActionType;
    facilityId: number | null;
    facilityName: string;
  }>({
    isOpen: false,
    type: null,
    facilityId: null,
    facilityName: '',
  });

  // Set maintenance mutation
  const setMaintenanceMutation = useMutation({
    mutationFn: async (facilityId: number) => {
      await api.put(`/facilities/${facilityId}/maintenance`, {
        maintenance_reason: "Under maintenance"
      });
    },
    onSuccess: () => {
      toast.success("Facility set to maintenance mode");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to set maintenance");
    },
  });

  // Clear maintenance mutation
  const clearMaintenanceMutation = useMutation({
    mutationFn: async (facilityId: number) => {
      await api.delete(`/facilities/${facilityId}/maintenance`);
    },
    onSuccess: () => {
      toast.success("Facility maintenance cleared");
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to clear maintenance");
    },
  });

  // Open confirmation dialog
  const openConfirmDialog = (type: ConfirmActionType, facilityId: number, facilityName: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      facilityId,
      facilityName,
    });
  };

  // Handle confirmed action
  // [USE CASE #13] Mengelola Fasilitas - Admin Action
  const handleConfirmedAction = () => {
    if (!confirmDialog.facilityId) return;

    switch (confirmDialog.type) {
      case 'delete':
        deleteMutation.mutate(confirmDialog.facilityId);
        break;
      case 'setMaintenance':
        setMaintenanceMutation.mutate(confirmDialog.facilityId);
        break;
      case 'clearMaintenance':
        clearMaintenanceMutation.mutate(confirmDialog.facilityId);
        break;
    }

    setConfirmDialog({ isOpen: false, type: null, facilityId: null, facilityName: '' });
  };

  // Get dialog content based on action type
  const getDialogContent = () => {
    switch (confirmDialog.type) {
      case 'delete':
        return {
          title: 'Hapus Fasilitas?',
          description: (
            <>
              Anda akan <span className="font-semibold text-red-600">menghapus</span> fasilitas{' '}
              <span className="font-semibold">"{confirmDialog.facilityName}"</span>.
              <br /><br />
              <span className="text-red-600 font-medium">⚠️ Tindakan ini tidak dapat dibatalkan!</span>
              <br />
              Semua data terkait fasilitas ini akan dihapus secara permanen.
            </>
          ),
          actionText: 'Ya, Hapus',
          actionClass: 'bg-red-600 hover:bg-red-700',
          icon: <Trash2 className="w-4 h-4 mr-2" />,
        };
      case 'setMaintenance':
        return {
          title: 'Set Maintenance Mode?',
          description: (
            <>
              Anda akan mengubah fasilitas{' '}
              <span className="font-semibold">"{confirmDialog.facilityName}"</span> ke mode{' '}
              <span className="font-semibold text-orange-600">maintenance</span>.
              <br /><br />
              Fasilitas tidak akan muncul di pencarian user dan tidak bisa dipesan selama maintenance.
            </>
          ),
          actionText: 'Ya, Set Maintenance',
          actionClass: 'bg-orange-600 hover:bg-orange-700',
          icon: <Wrench className="w-4 h-4 mr-2" />,
        };
      case 'clearMaintenance':
        return {
          title: 'Clear Maintenance?',
          description: (
            <>
              Anda akan mengaktifkan kembali fasilitas{' '}
              <span className="font-semibold">"{confirmDialog.facilityName}"</span>.
              <br /><br />
              Fasilitas akan kembali tersedia dan bisa dipesan oleh user.
            </>
          ),
          actionText: 'Ya, Aktifkan',
          actionClass: 'bg-green-600 hover:bg-green-700',
          icon: <CheckCircle className="w-4 h-4 mr-2" />,
        };
      default:
        return {
          title: 'Konfirmasi',
          description: 'Apakah Anda yakin?',
          actionText: 'Ya',
          actionClass: '',
          icon: null,
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Facilities</h1>
          <p className="text-muted-foreground">View and manage all facilities</p>
        </div>
        <Button asChild>
          <Link href="/AdminDashboard/ManageFacilitiesPage/CreateFacilityPage">
            <Plus className="w-4 h-4 mr-2" />
            Add Facility
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facility List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load facilities. Please try again later.
            </div>
          ) : facilities && facilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No facilities found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Building
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {facilities?.map((facility: any) => (
                    <tr key={facility.facility_id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{facility.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {facility.building_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {facility.type_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {facility.capacity || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {facility.maintenance_until && new Date(facility.maintenance_until) > new Date() ? (
                          <Badge variant="destructive">
                            <Wrench className="w-3 h-3 mr-1" />
                            Maintenance
                          </Badge>
                        ) : facility.is_active ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/AdminDashboard/ManageFacilitiesPage/EditFacilityPage/${facility.facility_id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>

                          {/* Maintenance Toggle Button */}
                          {facility.maintenance_until && new Date(facility.maintenance_until) > new Date() ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openConfirmDialog('clearMaintenance', facility.facility_id, facility.name)}
                              disabled={clearMaintenanceMutation.isPending}
                              className="text-green-600 hover:text-green-700"
                              title="Clear Maintenance"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openConfirmDialog('setMaintenance', facility.facility_id, facility.name)}
                              disabled={setMaintenanceMutation.isPending}
                              className="text-orange-600 hover:text-orange-700"
                              title="Set to Maintenance"
                            >
                              <Wrench className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openConfirmDialog('delete', facility.facility_id, facility.name)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, type: null, facilityId: null, facilityName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmDialog.type === 'delete' && <AlertTriangle className="w-5 h-5 text-red-600" />}
              {confirmDialog.type === 'setMaintenance' && <Wrench className="w-5 h-5 text-orange-600" />}
              {confirmDialog.type === 'clearMaintenance' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {dialogContent.title}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>{dialogContent.description}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={dialogContent.actionClass}
            >
              {dialogContent.icon}
              {dialogContent.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
