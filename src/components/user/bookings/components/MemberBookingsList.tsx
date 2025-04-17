
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { BookingDetailRow } from "../booking-table/BookingDetailRow";
import { Card, CardContent } from "@/components/ui/card";
import { JobsTable } from "../booking-table/JobsTable";
import { Artist } from "@/hooks/useBookingArtists";

interface MemberBookingsListProps {
  primaryBookings: any[];
  bookingGroups: Record<string, Booking[]>;
  onViewBooking: ((booking: Booking) => void) | undefined;
  statusOptions: {status_code: string; status_name: string}[];
  artists: Artist[];
  handleStatusChange: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment: (booking: Booking, artistId: string) => Promise<void>;
}

export const MemberBookingsList = ({ 
  primaryBookings, 
  bookingGroups,
  onViewBooking,
  statusOptions,
  artists,
  handleStatusChange,
  handleArtistAssignment
}: MemberBookingsListProps) => {
  const handleViewBookingClick = (booking: Booking) => {
    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  return (
    <div className="space-y-8">
      {primaryBookings.map((booking: any) => (
        <Card key={booking.Booking_NO} className="overflow-hidden">
          <BookingDetailRow 
            booking={booking} 
            onView={onViewBooking ? handleViewBookingClick : undefined}
          />
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3">Services</h3>
            {bookingGroups[booking.Booking_NO] && (
              <JobsTable
                bookingsGroup={bookingGroups[booking.Booking_NO]}
                onEditClick={() => {}} // Empty function as edit is not required
                isEditingDisabled={true} // Disable editing for members
                handleStatusChange={handleStatusChange}
                handleArtistAssignment={handleArtistAssignment}
                statusOptions={statusOptions}
                artists={artists}
                onViewBooking={onViewBooking}
                showActions={false} // Hide action buttons for members
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
