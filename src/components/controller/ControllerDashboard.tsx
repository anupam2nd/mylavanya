
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/hooks/useBookings";
import { ServiceStatusCard } from "./ServiceStatusCard";
import { ServiceFilters } from "./ServiceFilters";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";

export const ControllerDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistFilter, setArtistFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch all bookings
      const { data, error } = await supabase
        .from('BookMST')
        .select('*')
        .order('Booking_date', { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive"
        });
        return;
      }
      
      // Transform data to ensure Booking_NO is a string
      const transformedData: Booking[] = (data || []).map(booking => ({
        ...booking,
        Booking_NO: booking.Booking_NO?.toString() || ''
      }));
      
      setBookings(transformedData);
    } catch (error) {
      console.error("Unexpected error fetching bookings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    // Filter by artist if selected
    if (artistFilter !== null && booking.ArtistId !== artistFilter) {
      return false;
    }
    
    // Filter by status if selected
    if (statusFilter !== null && booking.Status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  // Prepare data for export
  const exportData = filteredBookings.map(booking => ({
    BookingNo: booking.Booking_NO,
    CustomerName: booking.name || 'N/A',
    Service: booking.ServiceName || booking.ProductName || 'N/A',
    Status: booking.Status || 'N/A',
    BookingDate: booking.Booking_date || 'N/A',
    BookingTime: booking.booking_time || 'N/A',
    Price: booking.price !== undefined ? booking.price.toString() : 'N/A',
    AssignedTo: booking.Assignedto || 'Not Assigned'
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Assigned Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.Assignedto).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.Status?.toLowerCase() === 'pending' || b.Status === 'P').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter(b => b.Status?.toLowerCase() === 'done' || b.Status === 'D').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and Export */}
      <div className="flex flex-wrap justify-between items-center">
        <ServiceFilters 
          onFilterByArtist={setArtistFilter}
          onFilterByStatus={setStatusFilter}
        />
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchBookings}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : "Refresh"}
          </Button>
          
          <ExportButton 
            data={exportData}
            filename="controller-bookings"
            headers={{
              BookingNo: "Booking #",
              CustomerName: "Customer",
              Service: "Service",
              Status: "Status",
              BookingDate: "Date",
              BookingTime: "Time",
              Price: "Price (₹)",
              AssignedTo: "Assigned To"
            }}
          />
        </div>
      </div>
      
      {/* Service Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <ServiceStatusCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500">No bookings found matching your filters.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setArtistFilter(null);
              setStatusFilter(null);
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
