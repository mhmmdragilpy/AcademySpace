"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Building, Calendar, Clock } from "lucide-react";

import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      // Check if it's new format or old
      if ((res as any).totalUsers !== undefined) {
        // It's the data directly (if interceptor didn't extract or extracted simpler object)
        return res as any;
      }
      // If interceptor didn't activate (no status=success), then res is AxiosResponse.
      // data is in res.data
      return (res as any).data || res;
    },
    enabled: !!session?.accessToken,
  });

  const StatsCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value !== undefined ? value : "-"}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Overview and management.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || stats?.usersCount}
            icon={Users}
            colorClass="text-blue-500"
          />
          <StatsCard
            title="Total Facilities"
            value={stats?.totalFacilities || stats?.facilitiesCount}
            icon={Building}
            colorClass="text-green-500"
          />
          <StatsCard
            title="Total Reservations"
            value={stats?.totalReservations || stats?.reservationsCount}
            icon={Calendar}
            colorClass="text-yellow-500"
          />
          <StatsCard
            title="Pending Approval"
            value={stats?.pendingReservations || stats?.pendingCount}
            icon={Clock}
            colorClass="text-red-500"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Management</CardTitle>
            <CardDescription>Quick access to administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-muted" asChild>
                <Link href="/admin/facilities">
                  <Building className="h-6 w-6" />
                  <span>Manage Facilities</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-muted" asChild>
                <Link href="/admin/reservations">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Reservations</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-muted" asChild>
                <Link href="/admin/users">
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-muted" asChild>
                <Link href="/admin/analytics">
                  <Clock className="h-6 w-6" />
                  <span>View Analytics</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivities?.map((activity: any, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.user || "System"}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
              {(!stats?.recentActivities || stats?.recentActivities.length === 0) && (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}