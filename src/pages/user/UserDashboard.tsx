
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { parseISO, subDays, format } from "date-fns";
import BookingStatusPieChart from "@/components/admin/dashboard/BookingStatusPieChart";
import ChartFilters from "@/components/admin/dashboard/ChartFilters";
import { Booking } from "@/hooks/useBookings";
import { toast } from "sonner";

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with last 30 days as default
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  // Track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // For displaying the filter state
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(endDate);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        console.log("No user found in context, skipping fetch");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Attempting to fetch bookings for user: ${user.email}`);
        
        const { data, error } = await supabase
          .from('BookMST')
          .select('*');
        
        if (error) {
          console.error('Error fetching all bookings:', error);
          setError("Failed to load bookings data");
          toast.error("Failed to load bookings data");
          return;
        }
        
        console.log(`Total bookings in system: ${data?.length || 0}`);
        
        // Filter to only show the current user's bookings
        const userBookings = data?.filter(booking => booking.email === user.email) || [];
        console.log(`User bookings found: ${userBookings.length}`);
        
        if (userBookings.length > 0) {
          console.log("Sample booking:", JSON.stringify(userBookings[0]));
        } else {
          console.log("No bookings found for the current user");
        }
        
        setBookings(userBookings);
      } catch (error) {
        console.error('Unexpected error in fetch:', error);
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user]);
  
  // Apply filters action
  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setFiltersApplied(true);
    toast.success(`Filtering data from ${startDate ? format(startDate, 'MMM dd, yyyy') : ''} to ${endDate ? format(endDate, 'MMM dd, yyyy') : ''}`);
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
    toast.info("Filters have been reset");
  };
  
  // Calculate recent bookings (last 30 days)
  const recentBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    return bookings.filter(booking => {
      if (!booking.Booking_date) return false;
      const date = parseISO(booking.Booking_date);
      return date >= thirtyDaysAgo;
    }).length;
  }, [bookings]);
  
  // Calculate awaiting confirmation bookings
  const awaitingConfirmation = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    return bookings.filter(booking => booking.Status === "pending").length;
  }, [bookings]);

  // Calculate confirmed bookings
  const confirmedBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    return bookings.filter(booking => booking.Status === "confirmed").length;
  }, [bookings]);

  console.log("Dashboard calculation results:", { 
    totalBookings: bookings.length, 
    recentBookings,
    awaitingConfirmation,
    isLoading: loading,
    error
  });

  return (
    <DashboardLayout title="Dashboard">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : bookings.length}</div>
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

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{error}</p>
          <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      )}

      {/* Chart Filters - Moved here, just above the pie charts */}
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

      {/* Main Dashboard Layout with Pie Charts */}
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
  );
};

export default UserDashboard;
