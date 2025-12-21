"use client";

import { useState } from "react";
import { useFacilities, useDeleteFacility } from "@/hooks/useFacilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Facility } from "@/types";
import { Plus, Edit, Trash2, Wrench, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminFacilitiesPage() {
  const { data: facilities, isLoading, error } = useFacilities({ includeInactive: true });
  const deleteMutation = useDeleteFacility();
  const queryClient = useQueryClient();

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

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  const handleSetMaintenance = (id: number, name: string) => {
    if (!confirm(`Set "${name}" to maintenance mode? It will not appear in user search.`)) return;
    setMaintenanceMutation.mutate(id);
  };

  const handleClearMaintenance = (id: number, name: string) => {
    if (!confirm(`Clear maintenance for "${name}"?`)) return;
    clearMaintenanceMutation.mutate(id);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Facilities</h1>
          <p className="text-muted-foreground">View and manage all facilities</p>
        </div>
        <Button asChild>
          <Link href="/admin/facilities/create">
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
                            <Link href={`/admin/facilities/edit/${facility.facility_id}`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>

                          {/* Maintenance Toggle Button */}
                          {facility.maintenance_until && new Date(facility.maintenance_until) > new Date() ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleClearMaintenance(facility.facility_id, facility.name)}
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
                              onClick={() => handleSetMaintenance(facility.facility_id, facility.name)}
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
                            onClick={() => handleDelete(facility.facility_id, facility.name)}
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
    </div>
  );
}