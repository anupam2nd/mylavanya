
import { useState, useMemo } from "react";
import { Booking } from "./useBookings";
import { useArtistFilters } from "./useArtistFilters";

export type FilterDateType = "booking" | "creation";
export type SortDirection = "asc" | "desc";
export type SortField = "booking_date" | "creation_date";

export const useBookingFilters = (bookings: Booking[]) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [filterDateType, setFilterDateType] = useState<FilterDateType>("booking");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortField, setSortField] = useState<SortField>("creation_date");

  // Use artist filters hook
  const {
    artistFilter,
    setArtistFilter,
    artistOptions,
    filteredByArtist,
    clearArtistFilter,
    getArtistName
  } = useArtistFilters(bookings);

  const filteredBookings = useMemo(() => {
    let filtered = filteredByArtist;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.name?.toLowerCase().includes(query) ||
        booking.email?.toLowerCase().includes(query) ||
        booking.Phone_no?.toString().includes(query) ||
        booking.Booking_NO?.toString().includes(query) ||
        booking.Address?.toLowerCase().includes(query) ||
        booking.Purpose?.toLowerCase().includes(query) ||
        booking.ServiceName?.toLowerCase().includes(query) ||
        booking.ProductName?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => 
        booking.Status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(booking => {
        const dateToCompare = filterDateType === "booking" 
          ? new Date(booking.Booking_date) 
          : new Date(booking.created_at);
        
        if (startDate && dateToCompare < startDate) return false;
        if (endDate && dateToCompare > endDate) return false;
        return true;
      });
    }

    // Sort bookings
    filtered.sort((a, b) => {
      let dateA: Date, dateB: Date;
      
      if (sortField === "creation_date") {
        dateA = new Date(a.created_at);
        dateB = new Date(b.created_at);
      } else {
        dateA = new Date(a.Booking_date);
        dateB = new Date(b.Booking_date);
      }

      const comparison = dateA.getTime() - dateB.getTime();
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [filteredByArtist, searchQuery, statusFilter, startDate, endDate, filterDateType, sortField, sortDirection]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
    setSearchQuery("");
    setShowDateFilter(false);
    clearArtistFilter();
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
    clearFilters,
    artistFilter,
    setArtistFilter,
    artistOptions,
    getArtistName
  };
};
