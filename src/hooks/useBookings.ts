
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: number;
  Booking_NO: string | number; // Updated to accept both string and number
  jobno?: number;
  name: string;
  email: string;
  Phone_no: number;
  Address?: string;
  Pincode?: number;
  Booking_date: string;
  booking_time: string;
  Purpose: string;
  ServiceName?: string;
  SubService?: string;
  ProductName?: string;
  price?: number;
  Qty?: number;
  Status: string;
  StatusUpdated?: string;
  Assignedto?: string;
  AssignedBY?: string;
  AssingnedON?: string;
  ArtistId?: number;
  created_at?: string;
  prod_id?: number;
  Scheme?: string;
}

export const useBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('BookMST')
        .select('*')
        .order('Booking_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to ensure Booking_NO is always a string for consistency
      const transformedData = data?.map(item => ({
        ...item,
        Booking_NO: item.Booking_NO?.toString() || ''
      })) as Booking[];
      
      setBookings(transformedData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Failed to load bookings",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return { bookings, setBookings, loading, fetchBookings };
};
