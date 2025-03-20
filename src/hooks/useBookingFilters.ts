
import { useState, useEffect } from "react";
import { isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { Booking } from "./useBookings";

export const useBookingFilters = (bookings: Booking[]) => {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    let result = [...bookings];
    
    if (startDate && endDate) {
      result = result.filter(booking => {
        const bookingDate = new Date(booking.Booking_date);
        return (
          isAfter(bookingDate, startOfDay(startDate)) && 
          isBefore(bookingDate, endOfDay(endDate))
        );
      });
    }
    
    if (statusFilter) {
      result = result.filter(booking => booking.Status === statusFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(booking => 
        (booking.Booking_NO && booking.Booking_NO.toLowerCase().includes(query)) ||
        (booking.name && booking.name.toLowerCase().includes(query)) ||
        (booking.email && booking.email.toLowerCase().includes(query)) ||
        (booking.Purpose && booking.Purpose.toLowerCase().includes(query))
      );
    }
    
    setFilteredBookings(result);
  }, [bookings, startDate, endDate, statusFilter, searchQuery]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("");
    setSearchQuery("");
    setFilteredBookings(bookings);
  };

  return {
    filteredBookings,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    showDateFilter,
    setShowDateFilter,
    clearFilters
  };
};
