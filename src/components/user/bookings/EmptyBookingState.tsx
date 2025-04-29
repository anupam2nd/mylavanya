
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyBookingStateProps {
  clearFilters: () => void;
}

const EmptyBookingState = ({ clearFilters }: EmptyBookingStateProps) => {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground">No bookings found.</p>
      <Button variant="outline" className="mt-4" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
};

export default EmptyBookingState;
