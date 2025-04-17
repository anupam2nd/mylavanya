
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import EditBookingDialog from "../EditBookingDialog";
import { Booking } from "@/hooks/useBookings";

interface BookingEditDialogProps {
  selectedBooking: Booking | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

export const BookingEditDialog = ({ 
  selectedBooking, 
  isDialogOpen, 
  setIsDialogOpen 
}: BookingEditDialogProps) => {
  if (!selectedBooking) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <EditBookingDialog 
        booking={selectedBooking}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Dialog>
  );
};
