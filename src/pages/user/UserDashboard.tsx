
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
import RevenuePieChart from "@/components/user/RevenuePieChart";
import { Navigate } from "react-router-dom";

const UserDashboard = () => {
  const { user } = useAuth();
  
  // Redirect controller users to admin dashboard
  if (user?.role === 'controller') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  
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
        console.log(`Attempting to fetch bookings for user: ${user.email}, role: ${user.role}, id: ${user.id}`);
        
        let query = supabase.from('BookMST').select('*');
        
        if (user.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            console.log("Filtering dashboard bookings by ArtistId:", artistId);
            query = query.eq('ArtistId', artistId);
          }
        } else {
          query = query.eq('email', user.email);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching bookings:', error);
          setError("Failed to load bookings data");
          toast.error("Failed to load bookings data");
          return;
        }
        
        console.log(`User bookings found: ${data?.length || 0}`);
        
        if (data?.length > 0) {
          console.log("Sample booking:", JSON.stringify(data[0]));
        } else {
          console.log("No bookings found for the current user");
        }
        
        // Transform data to ensure Booking_NO is a string
        const transformedData: Booking[] = (data || []).map(booking => ({
          ...booking,
          Booking_NO: booking.Booking_NO?.toString() || ''
        }));
        
        setBookings(transformedData);
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
  
  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setFiltersApplied(true);
    toast.success(`Filtering data from ${startDate ? format(startDate, 'MMM dd, yyyy') : ''} to ${endDate ? format(endDate, 'MMM dd, yyyy') : ''}`);
  };
  
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
  
  const recentBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    const thirtyDaysAgo = subDays(new Date(), 30);
    return bookings.filter(booking => {
      if (!booking.Booking_date) return false;
      const date = parseISO(booking.Booking_date);
      return date >= thirtyDaysAgo;
    }).length;
  }, [bookings]);

  const totalRevenue = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    return bookings.reduce((sum, booking) => {
      if (booking.Status === "done" || booking.Status === "confirmed" || booking.Status === "beautician_assigned") {
        return sum + (booking.price || 0);
      }
      return sum;
    }, 0);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    if (!appliedStartDate || !appliedEndDate) return bookings;
    
    return bookings.filter(booking => {
      if (!booking.Booking_date) return false;
      const date = parseISO(booking.Booking_date);
      return date >= appliedStartDate && date <= appliedEndDate;
    });
  }, [bookings, appliedStartDate, appliedEndDate]);

  console.log("Dashboard calculation results:", { 
    totalBookings: bookings.length, 
    recentBookings,
    totalRevenue,
    isLoading: loading,
    error
  });

  return (
    <DashboardLayout title="Dashboard">
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (
                <>
                  INR {totalRevenue.toLocaleString()}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed services
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{error}</p>
          <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      )}

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

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <RevenuePieChart 
          bookings={filteredBookings} 
          loading={loading}
          title="Revenue by Service"
          description="Distribution of revenue by service type"
        />

        <BookingStatusPieChart 
          bookings={bookings} 
          loading={loading} 
          startDate={appliedStartDate}
          endDate={appliedEndDate}
          title="Status by Booking Date"
          description="Distribution based on when services are scheduled"
          filterField="Booking_date"
        />
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
