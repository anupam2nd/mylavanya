
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import ChartFilters from "@/components/admin/dashboard/ChartFilters";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useChartFilters } from "@/hooks/useChartFilters";
import { DashboardCards } from "@/components/user/dashboard/DashboardCards";
import { DashboardError } from "@/components/user/dashboard/DashboardError";
import { DashboardCharts } from "@/components/user/dashboard/DashboardCharts";

const UserDashboard = () => {
  const { user } = useAuth();
  
  // Redirect controller users to admin dashboard
  if (user?.role === 'controller') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  const { bookings, recentBookings, totalRevenue, loading, error } = useDashboardData();
  
  const { 
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    appliedStartDate,
    appliedEndDate,
    applyFilters,
    resetFilters,
    filteredBookings
  } = useChartFilters(bookings);

  console.log("Dashboard calculation results:", { 
    totalBookings: bookings.length, 
    recentBookings,
    totalRevenue,
    isLoading: loading,
    error
  });

  return (
    <DashboardLayout title="Dashboard">
      <DashboardCards
        totalBookings={bookings.length}
        recentBookings={recentBookings}
        totalRevenue={totalRevenue}
        loading={loading}
      />

      <DashboardError error={error} />

      <div className="mb-4 mt-6">
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
        filteredBookings={filteredBookings}
        allBookings={bookings}
        loading={loading}
        startDate={appliedStartDate}
        endDate={appliedEndDate}
      />
    </DashboardLayout>
  );
};

export default UserDashboard;
