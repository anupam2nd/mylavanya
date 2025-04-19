
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useUserBookings } from "@/hooks/useUserBookings";
import BookingsList from "@/components/user/bookings/BookingsList";
import ArtistBookingDetails from "@/components/artist/ArtistBookingDetails";
import { Booking } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ArtistBookings = () => {
  const { bookings, loading } = useUserBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleBack = () => {
    setSelectedBooking(null);
  };

  const handleAddNewJob = async (bookingId: string, newService: any) => {
    try {
      // Get the existing booking to copy details
      const { data: existingBooking } = await supabase
        .from('BookMST')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (!existingBooking) {
        throw new Error('Booking not found');
      }

      // Create new job with the selected service
      const newJob = {
        ...existingBooking,
        id: undefined, // Let Supabase generate new ID
        jobno: undefined, // Will be set by database
        ServiceName: newService.Services,
        SubService: newService.Subservice,
        ProductName: newService.ProductName,
        price: newService.Price,
        Status: existingBooking.Status,
      };

      const { data, error } = await supabase
        .from('BookMST')
        .insert([newJob])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Service added successfully",
        description: "New service has been added to the booking",
      });

      // Refresh the booking list
      window.location.reload();
    } catch (error) {
      console.error('Error adding new service:', error);
      toast({
        title: "Error adding service",
        description: "There was a problem adding the new service",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout title="My Assigned Bookings">
        <Card>
          <CardContent className="pt-6">
            {selectedBooking ? (
              <ArtistBookingDetails 
                booking={selectedBooking} 
                onBack={handleBack}
                onAddNewJob={handleAddNewJob}
              />
            ) : (
              <BookingsList 
                customBookings={bookings} 
                customLoading={loading} 
                userRole="artist"
                onViewBooking={handleViewBooking}
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistBookings;
