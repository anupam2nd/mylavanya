
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Booking } from "@/hooks/useBookings";
import { Artist } from "@/hooks/useBookingArtists";

interface BookingsTableProps {
  bookings: Booking[];
  artists: Artist[];
}

export const BookingsTable = ({ bookings, artists }: BookingsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Artist</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((service) => (
          <TableRow key={service.id}>
            <TableCell>{service.ServiceName}</TableCell>
            <TableCell>
              {service.ProductName} {service.Qty && service.Qty > 1 && `x ${service.Qty}`}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{service.Booking_date}</span>
                <span className="text-sm text-muted-foreground">{service.booking_time}</span>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={service.Status || 'pending'} />
            </TableCell>
            <TableCell>
              {service.ArtistId
                ? artists.find((a) => a.ArtistId.toString() === service.ArtistId?.toString())
                  ? `${artists.find((a) => a.ArtistId.toString() === service.ArtistId?.toString())?.ArtistFirstName || ''} ${
                      artists.find((a) => a.ArtistId.toString() === service.ArtistId?.toString())?.ArtistLastName || ''
                    }`.trim()
                  : service.Assignedto || "Assigned"
                : "Unassigned"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
