
import { useState, useEffect } from "react";
import { isAfter, isBefore, startOfDay, endOfDay, parseISO } from "date-fns";
import { Booking } from "./useBookings";
import { supabase } from "@/integrations/supabase/client";

export type FilterDateType = "booking" | "creation";
export type SortDirection = "asc" | "desc";
export type SortField = "creation_date" | "booking_date";

// Function to normalize status values for comparison
const normalizeStatusValue = (status: string | undefined | null): string => {
  if (!status) return "";
  
  // Convert to lowercase and replace spaces with underscores
  return status.toLowerCase().replace(/\s+/g, '_');
};

export const useBookingFilters = (bookings: Booking[]) => {
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterDateType, setFilterDateType] = useState<FilterDateType>("booking");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortField, setSortField] = useState<SortField>("creation_date");
  const [statusMapping, setStatusMapping] = useState<Record<string, string>>({});

  // Fetch status mapping from statusmst table
  useEffect(() => {
    const fetchStatusMapping = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name')
          .eq('active', true);
        
        if (error) throw error;
        
        if (data) {
          // Create a mapping from status_code to status_name
          const mapping: Record<string, string> = {};
          data.forEach(status => {
            mapping[normalizeStatusValue(status.status_code)] = status.status_name;
          });
          setStatusMapping(mapping);
          console.log("Status mapping loaded:", mapping);
        }
      } catch (error) {
        console.error('Error fetching status mapping:', error);
      }
    };
    
    fetchStatusMapping();
  }, []);

  useEffect(() => {
    let result = [...bookings];
    
    if (startDate && endDate) {
      result = result.filter(booking => {
        const dateField = filterDateType === "booking" 
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
      console.log("Filtering by status:", statusFilter);
      console.log("Available statuses:", [...new Set(bookings.map(b => b.Status))]);
      
      result = result.filter(booking => {
        if (!booking.Status) return false;
        
        // First check if the booking status directly matches a status_name from the table
        if (Object.values(statusMapping).some(name => 
          name.toLowerCase() === booking.Status?.toLowerCase())) {
          // If the status is a status_name, match it directly against the filter
          return normalizeStatusValue(booking.Status) === normalizeStatusValue(statusFilter);
        } else {
          // If it's a status_code, try to match it using the mapping
          const normalizedBookingStatus = normalizeStatusValue(booking.Status);
          const normalizedFilterStatus = normalizeStatusValue(statusFilter);
          
          // Check if any of the status_codes map to the same status_name
          return normalizedBookingStatus === normalizedFilterStatus;
        }
      });
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
  }, [bookings, startDate, endDate, statusFilter, statusMapping, searchQuery, filterDateType, sortDirection, sortField]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter("all");
    setSearchQuery("");
    setFilterDateType("booking");
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
