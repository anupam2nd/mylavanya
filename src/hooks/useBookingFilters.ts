
import { useState, useEffect } from "react";
import { isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { Booking } from "./useBookings";

export const useBookingFilters = (bookings: Booking[]) => {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'booking_date' | 'created_at'>('booking_date');

  useEffect(() => {
    let result = [...bookings];
    
    if (startDate && endDate) {
      result = result.filter(booking => {
        const dateField = dateFilterType === 'booking_date' 
          ? booking.Booking_date 
          : booking.created_at;
        
        if (!dateField) return true;
        
        const bookingDate = typeof dateField === 'string' 
          ? parseISO(dateField) 
          : new Date(dateField);
        
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
  }, [bookings, startDate, endDate, statusFilter, searchQuery, dateFilterType]);

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
    dateFilterType,
    setDateFilterType,
    clearFilters
  };
};
