
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  loading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [completedBookings, setCompletedBookings] = useState<number>(0);
  const [inProgressBookings, setInProgressBookings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchBookingStats();
  }, []);

  return {
    totalBookings,
    pendingBookings,
    completedBookings,
    inProgressBookings,
    loading
  };
};
