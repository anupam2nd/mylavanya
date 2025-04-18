
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Booking } from "@/hooks/useBookings";

interface CustomerInfoProps {
  booking: Booking;
}

export const CustomerInfo = ({ booking }: CustomerInfoProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Name:</span> {booking.name}</p>
          <p><span className="font-medium">Email:</span> {booking.email}</p>
          <p><span className="font-medium">Phone:</span> {booking.Phone_no}</p>
          <p><span className="font-medium">Address:</span> {booking.Address}</p>
          {booking.Pincode && <p><span className="font-medium">Pincode:</span> {booking.Pincode}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
