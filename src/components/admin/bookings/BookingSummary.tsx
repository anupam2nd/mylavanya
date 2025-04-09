
import React from "react";
import { CardContent } from "@/components/ui/card";
import { SortField } from "@/hooks/useBookingFilters";

interface BookingSummaryProps {
  filteredBookingsCount: number;
  totalBookingsCount: number;
  sortField: SortField;
  sortDirection: "asc" | "desc";
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  filteredBookingsCount,
  totalBookingsCount,
  sortField,
  sortDirection
}) => {
  return (
    <CardContent>
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredBookingsCount} of {totalBookingsCount} bookings
        {sortField && (
          <span className="ml-2">
            sorted by {sortField === "creation_date" ? "creation date" : "booking date"} ({sortDirection === "desc" ? "newest first" : "oldest first"})
          </span>
        )}
      </div>
    </CardContent>
  );
};

export default BookingSummary;
