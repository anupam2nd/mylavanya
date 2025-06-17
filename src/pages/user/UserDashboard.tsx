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

const UserDashboard = () => {
  const { user } = useAuth();
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
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('BookMST').select('*');
        
        if (user.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            query = query.eq('ArtistId', artistId);
          }
        } else {
          query = query.eq('email', user.email);
        }
        
        const { data, error } = await query;
        
        if (error) {
          setError("Failed to load bookings data");
          toast.error("Failed to load bookings data");
          return;
        }
        
        // Transform data to ensure Booking_NO is a string
        const transformedData: Booking[] = (data || []).map(booking => ({
          ...booking,
          Booking_NO: booking.Booking_NO?.toString() || ''
        }));
        
        setBookings(transformedData);
      } catch (error) {
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
      try {
        const bookingDate = parseISO(booking.Booking_date);
        return bookingDate >= thirtyDaysAgo;
      } catch {
        return false;
      }
    }).length;
  }, [bookings]);
  
  const pendingBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    return bookings.filter(booking => 
      booking.Status === 'pending' || 
      booking.Status === 'Booking Confirmed'
    ).length;
  }, [bookings]);

  const completedBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return 0;
    
    return bookings.filter(booking => 
      booking.Status === 'done' || 
      booking.Status === 'Completed'
    ).length;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    return bookings.filter(booking => {
      try {
        const bookingDate = parseISO(booking.Booking_date);
        
        if (appliedStartDate && bookingDate < appliedStartDate) return false;
        if (appliedEndDate && bookingDate > appliedEndDate) return false;
        
        return true;
      } catch {
        return false;
      }
    });
  }, [bookings, appliedStartDate, appliedEndDate]);

  if (loading) {
    return (
      <DashboardLayout title={user?.role === 'artist' ? 'Artist Dashboard' : 'User Dashboard'}>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-500">Loading dashboard data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={user?.role === 'artist' ? 'Artist Dashboard' : 'User Dashboard'}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={user?.role === 'artist' ? 'Artist Dashboard' : 'User Dashboard'}>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookings.length}</div>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recentBookings}</div>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingBookings}</div>
              <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedBookings}</div>
              <p className="text-sm text-muted-foreground">Successfully finished</p>
            </CardContent>
          </Card>
        </div>

        <ChartFilters
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <BookingStatusPieChart 
            bookings={filteredBookings}
            loading={loading}
            startDate={appliedStartDate}
            endDate={appliedEndDate}
            title="Booking Status Distribution"
            description="Overview of booking statuses for the selected period"
            filterField="Booking_date"
          />
          <RevenuePieChart 
            bookings={filteredBookings}
            loading={loading}
            title="Revenue by Service"
            description="Revenue distribution across different services"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
