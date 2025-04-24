
import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookings } from "@/hooks/useBookings";
import BookingStatusPieChart from "@/components/admin/dashboard/BookingStatusPieChart";
import MonthlyBookingTrendsChart from "@/components/admin/dashboard/MonthlyBookingTrendsChart";
import BeauticianBookingsBarChart from "@/components/admin/dashboard/BeauticianBookingsBarChart";
import ChartFilters from "@/components/admin/dashboard/ChartFilters";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { parseISO, subDays, format, isToday, isSameDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  
  // Selected date for bookings card
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
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
  
  // Calculate selected date's bookings (excluding pending and cancelled)
  const selectedDateBookings = useMemo(() => {
    return bookings.filter(booking => {
      const date = booking.Booking_date ? parseISO(booking.Booking_date) : null;
      // Filter by date and exclude pending (P) and cancelled (C) statuses
      return date && 
             isSameDay(date, selectedDate) && 
             booking.Status !== "P" && 
             booking.Status !== "Pending" && 
             booking.Status !== "C" && 
             booking.Status !== "Cancelled";
    }).length;
  }, [bookings, selectedDate]);

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Dashboard">
        {/* Summary Cards */}
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
              <CardTitle className="text-sm font-medium">
                Bookings for {isToday(selectedDate) ? "Today" : format(selectedDate, 'dd MMM yyyy')}
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 p-0"
                  >
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : selectedDateBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                Active bookings for {format(selectedDate, 'dd MMM yyyy')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Booking Trends Chart */}
        <div className="mb-8 mt-6">
          <MonthlyBookingTrendsChart 
            bookings={bookings} 
            loading={loading}
            startDate={appliedStartDate}
            endDate={appliedEndDate}
          />
        </div>

        {/* Beautician Bookings Bar Chart */}
        <div className="mb-8">
          <BeauticianBookingsBarChart
            bookings={bookings}
            loading={loading}
            startDate={appliedStartDate}
            endDate={appliedEndDate}
          />
        </div>

        {/* Chart Filters - Moved here above the pie charts */}
        <div className="mb-4">
          <ChartFilters
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />
        </div>

        {/* Dashboard Charts Layout */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
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
