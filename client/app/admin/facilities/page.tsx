"use client";

import { useState } from "react";
import { useFacilities, useDeleteFacility } from "@/hooks/useFacilities";
import { toast } from "sonner";
import Link from "next/link";
import { Facility } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminFacilitiesPage() {
  const { data: facilities, isLoading, error } = useFacilities();
  const deleteMutation = useDeleteFacility();

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    deleteMutation.mutate(id);
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
                  {facilities?.map((facility) => (
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
                        <Badge variant={facility.is_active ? "default" : "secondary"}>
                          {facility.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/facilities/edit/${facility.facility_id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(facility.facility_id, facility.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
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