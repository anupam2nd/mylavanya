
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserBookings } from "@/hooks/useUserBookings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ArtistBookingCard from "@/components/artist/ArtistBookingCard";
import { useState } from "react";
import AddServiceDialog from "@/components/artist/AddServiceDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ArtistBookings = () => {
  const { bookings, loading, setBookings } = useUserBookings();
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: number;
    bookingNo: string;
    customerPhone: string;
    customerName: string;
    customerEmail: string;
  } | null>(null);

  const handleAddNewService = (booking: any) => {
    setSelectedBooking({
      id: booking.id,
      bookingNo: booking.Booking_NO.toString(),
      customerPhone: booking.Phone_no ? booking.Phone_no.toString() : '',
      customerName: booking.name,
      customerEmail: booking.email || ''
    });
    setIsAddServiceDialogOpen(true);
  };

  const refreshBookings = () => {
    // This will trigger a re-fetch of bookings
    window.location.reload();
  };

  // Group bookings by Booking_NO
  const groupedBookings = bookings.reduce((acc: Record<string, any[]>, booking) => {
    const bookingNo = booking.Booking_NO?.toString() || 'unknown';
    if (!acc[bookingNo]) {
      acc[bookingNo] = [];
    }
    acc[bookingNo].push(booking);
    return acc;
  }, {});

  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout title="My Bookings">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Assigned Bookings</h2>
          <p className="text-muted-foreground">
            Manage your assigned bookings and update their status
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You don't have any active bookings assigned to you yet.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
                  if (!bookingsGroup || !Array.isArray(bookingsGroup) || bookingsGroup.length === 0) {
                    return null;
                  }
                  
                  const firstBooking = bookingsGroup[0];
                  
                  return (
                    <Card key={bookingNo} className="border-primary/20">
                      <CardHeader className="pb-2 flex flex-row justify-between items-center">
                        <div>
                          <h3 className="text-base font-medium">Booking #{bookingNo}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>Customer: {firstBooking.name}</span>
                            {firstBooking.Address && (
                              <span className="ml-4 text-xs truncate max-w-[200px]">
                                📍 {firstBooking.Address}
                                {firstBooking.Pincode && `, ${firstBooking.Pincode}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleAddNewService(firstBooking)}
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add New Service
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {bookingsGroup.map((booking) => (
                            <ArtistBookingCard
                              key={`${booking.id}-${booking.jobno}`}
                              booking={booking}
                              onStatusUpdated={refreshBookings}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Service Dialog */}
        {selectedBooking && (
          <AddServiceDialog
            open={isAddServiceDialogOpen}
            onOpenChange={setIsAddServiceDialogOpen}
            bookingId={selectedBooking.id}
            bookingNo={selectedBooking.bookingNo}
            customerPhone={selectedBooking.customerPhone}
            customerName={selectedBooking.customerName}
            customerEmail={selectedBooking.customerEmail}
            onServiceAdded={refreshBookings}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistBookings;
