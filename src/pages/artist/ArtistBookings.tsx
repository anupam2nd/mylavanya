import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserBookings } from "@/hooks/useUserBookings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import AddServiceDialog from "@/components/artist/AddServiceDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter, SortAsc, SortDesc, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import ArtistBookingsList from "@/components/artist/ArtistBookingsList";
import { Badge } from "@/components/ui/badge";

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

  const activeFiltersCount = [
    statusFilter !== "all",
    sortBy !== "date_desc"
  ].filter(Boolean).length;

  return (
    <ProtectedRoute allowedRoles={["artist"]}>
      <DashboardLayout title="My Bookings">
        <div className="space-y-4 sm:space-y-6">
          <div className="px-1 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-bold">Assigned Bookings</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your assigned bookings and update their status
            </p>
          </div>

          {/* Mobile-First Filters */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Filter className="h-4 w-4 text-blue-600" />
                <span>Filters & Sorting</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mobile: Stack filters vertically */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Status Filter</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 sm:h-10">
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

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Newest First</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="date_asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Oldest First</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="price_desc">
                        <div className="flex items-center gap-2">
                          <SortDesc className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Price: High to Low</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="price_asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Price: Low to High</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                    disabled={activeFiltersCount === 0}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-lg sm:text-xl">
                  Your Assigned Bookings 
                  <span className="text-sm sm:text-base font-normal text-muted-foreground ml-2">
                    ({Object.keys(groupedBookings).length})
                  </span>
                </CardTitle>
                {Object.keys(groupedBookings).length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {statusFilter !== "all" ? `Filtered by: ${statusFilter}` : "All bookings"}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : Object.keys(groupedBookings).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl sm:text-6xl mb-4">
                    {statusFilter !== "all" ? "🔍" : "📋"}
                  </div>
                  <p className="text-sm sm:text-base mb-2">
                    {statusFilter !== "all" 
                      ? `No assigned bookings found with status "${statusFilter}"`
                      : "You don't have any assigned bookings yet."
                    }
                  </p>
                  {statusFilter !== "all" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
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
        </div>

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
