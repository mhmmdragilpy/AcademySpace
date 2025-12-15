"use client";

import { useState } from "react";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import { User } from "@/types";
import Link from "next/link";
import { Plus, Edit, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const deleteMutation = useDeleteUser();

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">View and manage user accounts</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/create">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
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
              Failed to load users. Please try again later.
            </div>
          ) : users && users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found.
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {users?.map((user) => (
                    <tr key={user.user_id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py4 whitespace-nowrap font-medium">{user.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                          {user.role === 'admin' ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <UserIcon className="w-3 h-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/users/edit/${user.user_id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.user_id, user.full_name)}
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