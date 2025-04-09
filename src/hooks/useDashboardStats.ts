
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
  statusCounts: Record<string, number>;
  loading: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [pendingBookings, setPendingBookings] = useState<number>(0);
  const [completedBookings, setCompletedBookings] = useState<number>(0);
  const [inProgressBookings, setInProgressBookings] = useState<number>(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { statusOptions } = useStatusOptions();
  const { toast: uiToast } = useToast();

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

        // Get count for each status
        const statusCountsObj: Record<string, number> = {};
        
        // Initialize counts with 0 for all statuses
        statusOptions.forEach(status => {
          statusCountsObj[status.status_code] = 0;
        });
        
        // Fetch all counts at once
        const { data: statusData, error: statusError } = await supabase
          .from('BookMST')
          .select('Status, count')
          .group('Status');
        
        if (statusError) throw statusError;
        
        if (statusData) {
          statusData.forEach(item => {
            if (item.Status) {
              statusCountsObj[item.Status] = item.count;
            }
          });
        }
        
        setStatusCounts(statusCountsObj);
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
    statusCounts,
    loading
  };
};
