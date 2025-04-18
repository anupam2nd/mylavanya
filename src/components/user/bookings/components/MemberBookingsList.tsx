
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { BookingDetailRow } from "../booking-table/BookingDetailRow";
import { Card, CardContent } from "@/components/ui/card";
import { JobsTable } from "../booking-table/JobsTable";
import { Artist } from "@/hooks/useBookingArtists";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag } from "lucide-react";
import CheckoutButton from "../CheckoutButton";

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
  // Filter confirmed bookings (exclude pending and awaiting_payment)
  const confirmedBookings = primaryBookings.filter(booking => 
    !['pending', 'awaiting_payment'].includes(booking.Status)
  );

  // Get pending bookings that need checkout
  const pendingBookings = primaryBookings.filter(booking => 
    ['pending', 'awaiting_payment'].includes(booking.Status)
  );

  const handleViewBookingClick = (booking: Booking) => {
    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  return (
    <div className="space-y-8">
      {/* Show checkout section if there are pending bookings */}
      {pendingBookings.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Pending Checkout</h3>
              </div>
              <CheckoutButton bookings={pendingBookings} />
            </div>
            <Alert>
              <AlertTitle>Complete your booking</AlertTitle>
              <AlertDescription>
                You have {pendingBookings.length} {pendingBookings.length === 1 ? 'booking' : 'bookings'} that {pendingBookings.length === 1 ? 'needs' : 'need'} to be checked out.
                Please complete the payment to confirm your appointment{pendingBookings.length > 1 ? 's' : ''}.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Show confirmed bookings in the table layout */}
      {confirmedBookings.map((booking: any) => (
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

      {confirmedBookings.length === 0 && !pendingBookings.length && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You don't have any bookings yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
