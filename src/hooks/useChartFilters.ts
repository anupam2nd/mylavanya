
import { useState, useMemo } from "react";
import { Booking } from "@/hooks/useBookings";
import { parseISO, subDays, format } from "date-fns";
import { toast } from "sonner";

export const useChartFilters = (bookings: Booking[]) => {
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const [appliedStartDate, setAppliedStartDate] = useState<Date | undefined>(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState<Date | undefined>(endDate);

  const applyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setFiltersApplied(true);
    toast.success(`Filtering data from ${startDate ? format(startDate, 'MMM dd, yyyy') : ''} to ${endDate ? format(endDate, 'MMM dd, yyyy') : ''}`);
  };
  
  const resetFilters = () => {
    const defaultStart = subDays(new Date(), 30);
    const defaultEnd = new Date();
    
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setAppliedStartDate(defaultStart);
    setAppliedEndDate(defaultEnd);
    setFiltersApplied(false);
    toast.info("Filters have been reset");
  };

  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    if (!appliedStartDate || !appliedEndDate) return bookings;
    
    return bookings.filter(booking => {
      if (!booking.Booking_date) return false;
      const date = parseISO(booking.Booking_date);
      return date >= appliedStartDate && date <= appliedEndDate;
    });
  }, [bookings, appliedStartDate, appliedEndDate]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filtersApplied,
    appliedStartDate,
    appliedEndDate,
    applyFilters,
    resetFilters,
    filteredBookings
  };
};
