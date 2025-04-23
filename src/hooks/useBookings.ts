
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string; // Always use string for ID consistency
  uuid: string;
  Booking_NO: string; // Always use string for Booking_NO
  jobno?: number;
  name: string;
  email: string; // Lowercase email property
  Email?: string; // Optional uppercase Email property for database flexibility
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
  originalPrice?: number; // Add originalPrice property
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
        const formattedBooking: Booking = {
          ...booking,
          id: booking.id.toString(),
          uuid: booking.uuid || booking.id.toString(),
          Booking_NO: booking.Booking_NO ? booking.Booking_NO.toString() : '', // Convert to string
          ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
          Product: booking.Product ? booking.Product.toString() : undefined,
          // Use lowercase email only
          email: booking.email || '',
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
