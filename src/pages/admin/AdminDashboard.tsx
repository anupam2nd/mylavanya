
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Calendar, CalendarCheck, Users, Clock, Activity } from "lucide-react";
import MonthlyBookingsChart from "@/components/admin/dashboard/MonthlyBookingsChart";
import MonthlyBookingTrendsChart from "@/components/admin/dashboard/MonthlyBookingTrendsChart";
import BookingStatusPieChart from "@/components/admin/dashboard/BookingStatusPieChart";
import BookingStatsPieChart from "@/components/admin/dashboard/BookingStatsPieChart";
import ChartFilters from "@/components/admin/dashboard/ChartFilters";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [completedBookings, setCompletedBookings] = useState<number>(0);
  const [inProgressBookings, setInProgressBookings] = useState<number>(0);

  // Function to fetch booking statistics
  const fetchBookingStats = async () => {
    try {
      // Get total bookings
      const { count: totalCount, error: totalError } = await supabase
        .from('BookMST')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      setTotalBookings(totalCount || 0);

      // Get pending bookings
      const { count: pendingCount, error: pendingError } = await supabase
        .from('BookMST')
        .select('*', { count: 'exact', head: true })
        .eq('Status', 'pending');
      
      if (pendingError) throw pendingError;
      setPendingBookings(pendingCount || 0);

      // Get completed bookings
      const { count: completedCount, error: completedError } = await supabase
        .from('BookMST')
        .select('*', { count: 'exact', head: true })
        .eq('Status', 'done');
      
      if (completedError) throw completedError;
      setCompletedBookings(completedCount || 0);

      // Get in-progress bookings (approve, process, ontheway, service_started)
      const { count: inProgressCount, error: inProgressError } = await supabase
        .from('BookMST')
        .select('*', { count: 'exact', head: true })
        .in('Status', ['approve', 'process', 'ontheway', 'service_started']);
      
      if (inProgressError) throw inProgressError;
      setInProgressBookings(inProgressCount || 0);
    } catch (error) {
      console.error("Error fetching booking stats:", error);
    }
  };

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const applyFilters = () => {
    // Filter charts based on selected date range
    console.log("Applying date filters:", { startDate, endDate });
  };

  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Admin Dashboard">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">All-time bookings in the system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval or assignment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressBookings}</div>
              <p className="text-xs text-muted-foreground">Currently being serviced</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookings}</div>
              <p className="text-xs text-muted-foreground">Successfully completed bookings</p>
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

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Monthly Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyBookingTrendsChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingStatusPieChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Monthly Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyBookingsChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingStatsPieChart startDate={startDate} endDate={endDate} />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
