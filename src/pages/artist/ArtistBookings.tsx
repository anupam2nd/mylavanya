
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useUserBookings } from "@/hooks/useUserBookings";
import BookingsList from "@/components/user/bookings/BookingsList";

const ArtistBookings = () => {
  const { bookings, loading } = useUserBookings();

  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout title="My Assigned Bookings">
        <Card>
          <CardContent className="pt-6">
            <BookingsList 
              customBookings={bookings} 
              customLoading={loading} 
              userRole="artist"
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistBookings;
