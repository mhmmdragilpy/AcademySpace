"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { LazyBar, LazyPie, LazyLine } from "@/components/LazyCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle, Clock, FileText } from "lucide-react";

// Types
interface Stats {
  totalReservations: number;
  approvedReservations: number;
  pendingReservations: number;
  rejectedReservations: number;
  recentReservations: number;
  topFacilities: { facility_name: string; reservation_count: number }[];
}

interface Utilization {
  dailyUtilization: { date: string; reservation_count: number }[];
  facilitiesUtilization: {
    id: number;
    facility_name: string;
    facility_type: string;
    building: string;
    capacity: number;
    total_reservations: number;
    avg_participants: number;
  }[];
}

interface Activity {
  weeklyActivity: { reservation_count: number }[];
  activeUsers: { name: string; username: string; department: string; reservation_count: number }[];
}

export default function AnalyticsPage() {
  const { data: session } = useSession();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const res = await api.get("/reservations/stats");
      return res.data as Stats;
    },
    enabled: !!session?.accessToken,
  });

  const { data: utilization, isLoading: utilizationLoading } = useQuery({
    queryKey: ['analytics-utilization'],
    queryFn: async () => {
      const res = await api.get("/reservations/utilization");
      return res.data as Utilization;
    },
    enabled: !!session?.accessToken,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['analytics-activity'],
    queryFn: async () => {
      const res = await api.get("/reservations/user-activity");
      return res.data as Activity;
    },
    enabled: !!session?.accessToken,
  });

  const isLoading = statsLoading || utilizationLoading || activityLoading;

  // Prepare data for charts
  const reservationStatusData = stats ? {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        label: 'Reservation Status',
        data: [
          stats.approvedReservations || 0,
          stats.pendingReservations || 0,
          stats.rejectedReservations || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const topFacilitiesData = stats?.topFacilities ? {
    labels: stats.topFacilities.map((f) => f.facility_name),
    datasets: [
      {
        label: 'Reservation Count',
        data: stats.topFacilities.map((f) => f.reservation_count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const dailyUtilizationData = utilization?.dailyUtilization ? {
    labels: utilization.dailyUtilization.map((d) => d.date),
    datasets: [
      {
        label: 'Reservations per Day',
        data: utilization.dailyUtilization.map((d) => d.reservation_count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  } : null;

  const weeklyActivityData = activity?.weeklyActivity ? {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: 'Reservations by Day of Week',
        data: activity.weeklyActivity.map((d) => d.reservation_count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
        <p className="text-muted-foreground">Comprehensive reports and statistics for facility utilization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.approvedReservations || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">{stats?.pendingReservations || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past 30 Days</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{stats?.recentReservations || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading || !reservationStatusData ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <LazyPie
                  data={reservationStatusData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading || !topFacilitiesData ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <LazyBar
                  data={topFacilitiesData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Reservation Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {utilizationLoading || !dailyUtilizationData ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <LazyLine
                  data={dailyUtilizationData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Reservation Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading || !weeklyActivityData ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <LazyBar
                  data={weeklyActivityData}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          {utilizationLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Facility</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Building</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Reservations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Avg. Participants</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {utilization?.facilitiesUtilization?.map((facility) => (
                    <tr key={facility.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{facility.facility_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{facility.facility_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{facility.building}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{facility.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{facility.total_reservations}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                        {facility.avg_participants ? Math.round(facility.avg_participants) : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Reservations</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {activity?.activeUsers?.map((user, index: number) => (
                    <tr key={user.username || index} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">@{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{user.department || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{user.reservation_count}</td>
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