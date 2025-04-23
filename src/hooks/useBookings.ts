
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string; // Changed from number to string
  uuid: string;
  Booking_NO: string;
  jobno?: number;
  name: string;
  email: string; // Keep lowercase in the interface for consistent usage in code
  Email?: string; // Add capitalized version too for database flexibility
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
  ArtistId?: string; // UUID as string
  created_at?: string;
  Product?: string; // UUID as string
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
      
      // Ensure all IDs are strings and handle email field properly
      const formattedBookings = data?.map(booking => {
        const formattedBooking = {
          ...booking,
          id: booking.id.toString(),
          uuid: booking.uuid || booking.id.toString(),
          ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
          Product: booking.Product ? booking.Product.toString() : undefined,
          // Use lowercase email consistently in our code
          email: booking.email || booking.Email || '',
        };
        
        return formattedBooking;
      }) || [];
      
      setBookings(formattedBookings);
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
