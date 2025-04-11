
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useUserBookings } from "@/hooks/useUserBookings";
import BookingsList from "@/components/user/bookings/BookingsList";
import ArtistBookingDetails from "@/components/artist/ArtistBookingDetails";
import { Booking } from "@/hooks/useBookings";

const ArtistBookings = () => {
  const { bookings, loading } = useUserBookings();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleBack = () => {
    setSelectedBooking(null);
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
