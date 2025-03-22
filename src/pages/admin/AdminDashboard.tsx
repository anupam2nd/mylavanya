
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookings } from "@/hooks/useBookings";
import BookingStatusPieChart from "@/components/admin/dashboard/BookingStatusPieChart";
import MonthlyBookingsChart from "@/components/admin/dashboard/MonthlyBookingsChart"; 
import ChartFilters from "@/components/admin/dashboard/ChartFilters";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { parseISO, subDays } from "date-fns";

const AdminDashboard = () => {
  const { bookings, loading } = useBookings();
  
  // Initialize with last 30 days as default
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  // Track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // For displaying the filter state
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(endDate);
  
  // Apply filters action
  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setFiltersApplied(true);
  };
  
  // Reset filters action
  const resetFilters = () => {
    const defaultStart = subDays(new Date(), 30);
    const defaultEnd = new Date();
    
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setAppliedStartDate(defaultStart);
    setAppliedEndDate(defaultEnd);
    setFiltersApplied(false);
  };
  
  // Calculate recent bookings for the card
  const recentBookings = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return bookings.filter(booking => {
      const date = booking.Booking_date ? parseISO(booking.Booking_date) : null;
      return date && date >= thirtyDaysAgo;
    }).length;
  }, [bookings]);
  
  // Calculate awaiting confirmation bookings
  const awaitingConfirmation = useMemo(() => {
    return bookings.filter(booking => booking.Status === "P").length;
  }, [bookings]);

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Dashboard">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                All time booking records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : recentBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Confirmation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : awaitingConfirmation}
              </div>
              <p className="text-xs text-muted-foreground">
                Bookings requiring your action
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Filters */}
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

        {/* Monthly Bookings Chart */}
        <div className="mt-2">
          <MonthlyBookingsChart 
            bookings={bookings} 
            loading={loading}
            startDate={appliedStartDate}
            endDate={appliedEndDate}
          />
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {/* Booking Status Pie Chart based on booking date */}
          <BookingStatusPieChart 
            bookings={bookings} 
            loading={loading} 
            startDate={appliedStartDate}
            endDate={appliedEndDate}
            title="Status by Booking Date"
            description="Distribution based on when services are scheduled"
            filterField="Booking_date"
          />

          {/* Booking Status Pie Chart based on creation date */}
          <BookingStatusPieChart 
            bookings={bookings} 
            loading={loading}
            startDate={appliedStartDate}
            endDate={appliedEndDate}
            title="Status by Creation Date"
            description="Distribution based on when bookings were created"
            filterField="created_at"
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
