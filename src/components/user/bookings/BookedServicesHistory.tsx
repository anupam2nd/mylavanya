
import React from "react";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface BookedServicesHistoryProps {
  bookings: Booking[];
}

function getArtistName(booking: Booking) {
  // Show assigned artist, fallback to "-"
  return booking.Assignedto || booking.ArtistId || "-";
}

function getServiceName(booking: Booking) {
  return booking.ProductName || booking.ServiceName || "Service";
}

function formatDate(dateStr: string) {
  // Booking_date is a string, try to format as DD MMM, YYYY
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(time: string) {
  return time || "-";
}

function getStatus(booking: Booking) {
  return booking.Status || "pending";
}

function getTotalCost(booking: Booking) {
  // Format as INR
  let total = Number(booking.price || 0);
  if (booking.Qty) total = total * Number(booking.Qty);
  // Up to 2 decimals, but no decimals if integer (₹200 not ₹200.00)
  return total % 1 === 0 ? `₹${total}` : `₹${total.toFixed(2)}`;
}

const BookedServicesHistory: React.FC<BookedServicesHistoryProps> = ({ bookings }) => {
  // Sort: Most recent first. Booking_date may not be a Date - convert to Date
  const sortedBookings = [...bookings].sort((a, b) => {
    const da = new Date(a.Booking_date || "");
    const db = new Date(b.Booking_date || "");
    return db.getTime() - da.getTime(); // Descending: Newest first
  });

  // Responsive: Table for md+, Cards for sm
  // If no bookings, show empty state
  if (!sortedBookings.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No services booked yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Title */}
      <h2 className="text-xl font-semibold mb-4 text-primary">Booked Services History</h2>
      {/* Table for md+ screens */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Booking Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Artist Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{getServiceName(booking)}</TableCell>
                <TableCell>{formatDate(booking.Booking_date)}</TableCell>
                <TableCell>{formatTime(booking.booking_time)}</TableCell>
                <TableCell>{getArtistName(booking)}</TableCell>
                <TableCell>
                  <StatusBadge status={getStatus(booking)} />
                </TableCell>
                <TableCell className="font-semibold">{getTotalCost(booking)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Card-list for small screens */}
      <div className="md:hidden flex flex-col gap-4">
        {sortedBookings.map((booking) => (
          <Card key={booking.id} className="shadow-sm border-primary/20 hover:shadow-md transition-shadow duration-200">
            <CardContent className="py-4 px-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-base text-primary">{getServiceName(booking)}</span>
                <StatusBadge status={getStatus(booking)} className="ml-2" />
              </div>
              <div className="grid grid-cols-2 text-sm text-gray-600 mb-2 gap-y-1">
                <span className="font-medium">Date:</span>
                <span>{formatDate(booking.Booking_date)}</span>
                <span className="font-medium">Time:</span>
                <span>{formatTime(booking.booking_time)}</span>
                <span className="font-medium">Artist:</span>
                <span>{getArtistName(booking)}</span>
                <span className="font-medium">Total:</span>
                <span className="font-semibold">{getTotalCost(booking)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookedServicesHistory;
