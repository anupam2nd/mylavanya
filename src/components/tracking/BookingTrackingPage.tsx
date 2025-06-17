import React, { useState } from "react";
import BookingTrackingForm from "./BookingTrackingForm";
import BookingTrackingResult from "./BookingTrackingResult";
import { Booking } from "@/hooks/useBookings";

const BookingTrackingPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleBookingFound = (foundBookings: Booking[]) => {
    if (foundBookings && foundBookings.length > 0) {
      setBookings(foundBookings);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Track Your Booking</h1>
      <BookingTrackingForm onBookingFound={handleBookingFound} />
      <BookingTrackingResult bookings={bookings} />
    </div>
  );
};

export default BookingTrackingPage;
