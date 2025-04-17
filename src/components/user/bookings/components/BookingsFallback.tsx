
import React from "react";
import { Loader2 } from "lucide-react";

interface BookingsFallbackProps {
  loading: boolean;
  isEmpty: boolean;
}

export const BookingsFallback = ({ loading, isEmpty }: BookingsFallbackProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }
  
  return null;
};
