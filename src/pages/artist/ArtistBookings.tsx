
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserBookings } from "@/hooks/useUserBookings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import AddServiceDialog from "@/components/artist/AddServiceDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter, SortAsc, SortDesc } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import ArtistBookingsList from "@/components/artist/ArtistBookingsList";

const ArtistBookings = () => {
  const { bookings, loading, setBookings } = useUserBookings();
  const { formattedStatusOptions } = useStatusOptions();
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: number;
    bookingNo: string;
    customerPhone: string;
    customerName: string;
    customerEmail: string;
  } | null>(null);

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

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

  const clearFilters = () => {
    setStatusFilter("all");
    setSortBy("date_desc");
  };

  // Filter out pending bookings - only show assigned bookings
  const assignedBookings = bookings.filter(booking => {
    const status = booking.Status?.toLowerCase() || "";
    return !["pending", "cancelled", "p", "c"].includes(status);
  });

  // Filter bookings by status
  const filteredBookings = assignedBookings.filter(booking => {
    if (statusFilter === "all") return true;
    return booking.Status?.toLowerCase() === statusFilter.toLowerCase();
  });

  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortBy) {
      case "date_asc":
        return new Date(a.Booking_date).getTime() - new Date(b.Booking_date).getTime();
      case "date_desc":
        return new Date(b.Booking_date).getTime() - new Date(a.Booking_date).getTime();
      case "price_asc":
        return (a.price || 0) - (b.price || 0);
      case "price_desc":
        return (b.price || 0) - (a.price || 0);
      default:
        return new Date(b.Booking_date).getTime() - new Date(a.Booking_date).getTime();
    }
  });

  // Group bookings by Booking_NO
  const groupedBookings = sortedBookings.reduce((acc: Record<string, any[]>, booking) => {
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

        {/* Filters and Sorting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Sorting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {formattedStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.status_name}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:w-48">
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" />
                        Date (Newest First)
                      </div>
                    </SelectItem>
                    <SelectItem value="date_asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Date (Oldest First)
                      </div>
                    </SelectItem>
                    <SelectItem value="price_desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="h-4 w-4" />
                        Price (High to Low)
                      </div>
                    </SelectItem>
                    <SelectItem value="price_asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Price (Low to High)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Bookings ({Object.keys(groupedBookings).length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : Object.keys(groupedBookings).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {statusFilter !== "all" 
                  ? `No assigned bookings found with status "${statusFilter}"`
                  : "You don't have any assigned bookings yet."
                }
              </div>
            ) : (
              <ArtistBookingsList 
                groupedBookings={groupedBookings}
                onAddNewService={handleAddNewService}
                onRefreshBookings={refreshBookings}
              />
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
