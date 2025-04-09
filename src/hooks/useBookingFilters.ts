
import { useState, useEffect } from "react";
import { isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { Booking } from "./useBookings";

export type FilterDateType = "booking_date" | "creation_date";
export type SortDirection = "asc" | "desc";
export type SortField = "creation_date" | "booking_date";

export const useBookingFilters = (bookings: Booking[]) => {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterDateType, setFilterDateType] = useState<FilterDateType>("booking_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortField, setSortField] = useState<SortField>("creation_date");

  useEffect(() => {
    let result = [...bookings];
    
    if (startDate && endDate) {
      result = result.filter(booking => {
        const dateField = filterDateType === "booking_date" 
          ? booking.Booking_date 
          : booking.created_at;
          
        if (!dateField) return true;
        
        const bookingDate = parseISO(dateField);
        return (
          isAfter(bookingDate, startOfDay(startDate)) && 
          isBefore(bookingDate, endOfDay(endDate))
        );
      });
    }
    
    if (statusFilter && statusFilter !== "all") {
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
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      const fieldA = sortField === "creation_date" ? a.created_at : a.Booking_date;
      const fieldB = sortField === "creation_date" ? b.created_at : b.Booking_date;
      
      if (!fieldA) return sortDirection === "asc" ? -1 : 1;
      if (!fieldB) return sortDirection === "asc" ? 1 : -1;
      
      // Convert to dates for comparison
      const dateA = new Date(fieldA);
      const dateB = new Date(fieldB);
      
      return sortDirection === "asc" 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    });
    
    setFilteredBookings(result);
  }, [bookings, startDate, endDate, statusFilter, searchQuery, filterDateType, sortDirection, sortField]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
    setSearchQuery("");
    setFilterDateType("booking_date");
    // Don't reset sort options when clearing filters
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
    filterDateType,
    setFilterDateType,
    sortDirection,
    setSortDirection,
    sortField,
    setSortField,
    clearFilters
  };
};
