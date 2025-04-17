
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useStatusOptions } from "@/hooks/useStatusOptions";

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  totalRevenue: number;
  totalServices: number;
  statusCounts: Record<string, number>;
  loading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [completedBookings, setCompletedBookings] = useState<number>(0);
  const [inProgressBookings, setInProgressBookings] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalServices, setTotalServices] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { statusOptions } = useStatusOptions();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        setLoading(true);
        
        // Get unique bookings based on Booking_NO
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('BookMST')
          .select('Booking_NO')
          .not('Booking_NO', 'is', null);
        
        if (bookingsError) throw bookingsError;
        
        // Count unique booking numbers
        const uniqueBookingNos = new Set(bookingsData.map(b => b.Booking_NO));
        setTotalBookings(uniqueBookingNos.size);

        // Get total service count based on ProductName
        const { data: servicesData, error: servicesError } = await supabase
          .from('BookMST')
          .select('ProductName')
          .not('ProductName', 'is', null);
          
        if (servicesError) throw servicesError;
        
        // Count unique service names
        const uniqueServiceNames = new Set(servicesData.filter(s => s.ProductName).map(s => s.ProductName));
        setTotalServices(uniqueServiceNames.size);

        // Get pending bookings (unique by Booking_NO)
        const { data: pendingData, error: pendingError } = await supabase
          .from('BookMST')
          .select('Booking_NO')
          .eq('Status', 'pending');
        
        if (pendingError) throw pendingError;
        
        const uniquePendingBookings = new Set(pendingData.map(b => b.Booking_NO));
        setPendingBookings(uniquePendingBookings.size);

        // Get completed bookings (unique by Booking_NO)
        const { data: completedData, error: completedError } = await supabase
          .from('BookMST')
          .select('Booking_NO')
          .eq('Status', 'done');
        
        if (completedError) throw completedError;
        
        const uniqueCompletedBookings = new Set(completedData.map(b => b.Booking_NO));
        setCompletedBookings(uniqueCompletedBookings.size);

        // Get in-progress bookings (unique by Booking_NO)
        const { data: inProgressData, error: inProgressError } = await supabase
          .from('BookMST')
          .select('Booking_NO')
          .in('Status', ['approve', 'process', 'ontheway', 'service_started']);
        
        if (inProgressError) throw inProgressError;
        
        const uniqueInProgressBookings = new Set(inProgressData.map(b => b.Booking_NO));
        setInProgressBookings(uniqueInProgressBookings.size);

        // Get total revenue from completed bookings
        const { data: revenueData, error: revenueError } = await supabase
          .from('BookMST')
          .select('price')
          .eq('Status', 'done');
        
        if (revenueError) throw revenueError;
        
        const revenue = revenueData
          ? revenueData.reduce((sum, booking) => sum + (booking.price || 0), 0)
          : 0;
        
        setTotalRevenue(revenue);

        // Get count for each status using RPC function or fallback
        const { data: statusData, error: statusError } = await (supabase.rpc as any)(
          'get_booking_counts_by_status'
        ) as { data: Array<{ status: string; count: number }> | null; error: any };
        
        if (statusError) {
          console.error("Error fetching status counts:", statusError);
          
          // Initialize counts with 0 for all statuses
          const statusCountsObj: Record<string, number> = {};
          statusOptions.forEach(status => {
            statusCountsObj[status.status_code] = 0;
          });
          
          // Fallback: perform individual queries for each status
          await Promise.all(statusOptions.map(async (status) => {
            const { count, error } = await supabase
              .from('BookMST')
              .select('*', { count: 'exact', head: true })
              .eq('Status', status.status_code);
            
            if (!error && count !== null) {
              statusCountsObj[status.status_code] = count;
            }
          }));
          
          setStatusCounts(statusCountsObj);
        } else if (statusData) {
          // Process the status count data from RPC
          const statusCountsObj: Record<string, number> = {};
          
          statusOptions.forEach(status => {
            statusCountsObj[status.status_code] = 0;
          });
          
          if (Array.isArray(statusData)) {
            statusData.forEach((item: { status: string; count: number }) => {
              if (item && item.status) {
                statusCountsObj[item.status] = item.count;
              }
            });
          }
          
          setStatusCounts(statusCountsObj);
        }
      } catch (error) {
        console.error("Error fetching booking stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStats();
  }, [statusOptions]);

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    inProgressBookings,
    totalRevenue,
    totalServices,
    statusCounts,
    loading
  };
};
