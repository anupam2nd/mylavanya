
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ChartFilters from "@/components/admin/dashboard/ChartFilters";
import { useBookings } from "@/hooks/useBookings";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatusOptions } from "@/hooks/useStatusOptions";

const AdminDashboard = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const { bookings, loading: bookingsLoading } = useBookings();
  const { 
    totalBookings, 
    pendingBookings, 
    completedBookings, 
    inProgressBookings,
    totalRevenue,
    totalServices,
    statusCounts,
    loading: statsLoading 
  } = useDashboardStats();
  const { statusOptions } = useStatusOptions();

  const applyFilters = () => {
    // Filter charts based on selected date range
    console.log("Applying date filters:", { startDate, endDate });
  };

  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "controller"]}>
      <DashboardLayout title="Admin Dashboard">
        <StatCards 
          totalBookings={totalBookings}
          pendingBookings={pendingBookings}
          completedBookings={completedBookings}
          inProgressBookings={inProgressBookings}
          totalServices={totalServices}
          totalRevenue={totalRevenue}
          loading={statsLoading}
        />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Counts by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {statusOptions.map((status) => (
                  <div key={status.status_code} className="flex flex-col p-4 rounded-md border">
                    <span className="text-sm text-muted-foreground">{status.status_name} Bookings</span>
                    <span className="text-2xl font-bold">
                      {statsLoading ? "..." : statusCounts[status.status_code] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <ChartFilters
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />
        </div>

        <DashboardCharts 
          bookings={bookings}
          loading={bookingsLoading}
          startDate={startDate}
          endDate={endDate}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
