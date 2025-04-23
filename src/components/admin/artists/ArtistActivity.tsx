import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Artist } from "@/types/artist";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArtistActivityProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artist: Artist | null;
}

interface BookingSummary {
  status: string;
  count: number;
}

interface Booking {
  id: number;
  Booking_NO: string;
  Booking_date: string;
  booking_time: string;
  name: string;
  Status: string;
  ServiceName: string;
  SubService: string;
  price: number;
  AssignedBY: string;
  AssingnedON: string;
}

export default function ArtistActivity({
  open,
  onOpenChange,
  artist,
}: ArtistActivityProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [summary, setSummary] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && artist) {
      fetchArtistBookings();
    }
  }, [open, artist]);

  const fetchArtistBookings = async () => {
    if (!artist) return;
    
    setLoading(true);
    try {
      // Fetch artist's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('BookMST')
        .select('*')
        .eq('ArtistId', artist.ArtistId)
        .order('Booking_date', { ascending: false });

      if (bookingsError) throw bookingsError;
      
      const formattedBookings = bookingsData?.map(booking => ({
          ...booking,
          id: booking.id.toString(),
          Booking_NO: booking.Booking_NO ? booking.Booking_NO.toString() : '',
          ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined
      })) || [];
      
      setBookings(formattedBookings);

      // Calculate summary statistics
      const bookingsByStatus: Record<string, number> = {};
      bookingsData?.forEach(booking => {
        const status = booking.Status || 'unknown';
        bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;
      });

      const summaryData: BookingSummary[] = Object.entries(bookingsByStatus).map(
        ([status, count]) => ({ status, count })
      );
      
      setSummary(summaryData);
    } catch (error) {
      console.error('Error fetching artist bookings:', error);
      toast({
        title: "Failed to load artist activity",
        description: "Could not retrieve booking information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!artist) return null;

  const completedBookings = bookings.filter(b => b.Status === 'done').length;
  const pendingBookings = bookings.filter(b => b.Status !== 'done' && b.Status !== 'cancel').length;
  const cancelledBookings = bookings.filter(b => b.Status === 'cancel').length;
  const totalEarnings = bookings
    .filter(b => b.Status === 'done')
    .reduce((sum, booking) => sum + (booking.price || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Artist Activity - {artist.ArtistFirstName} {artist.ArtistLastName}</DialogTitle>
          <DialogDescription>
            View booking history and performance metrics for this artist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{bookings.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-green-600">{completedBookings}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold text-amber-600">{pendingBookings}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">₹{totalEarnings}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings">Booking History</TabsTrigger>
              <TabsTrigger value="summary">Status Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings" className="mt-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No booking history found for this artist.
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.Booking_NO}</TableCell>
                          <TableCell>
                            {new Date(booking.Booking_date).toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {new Date(`2000-01-01T${booking.booking_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </TableCell>
                          <TableCell>{booking.name || 'Unknown'}</TableCell>
                          <TableCell>
                            {booking.ServiceName}
                            {booking.SubService && (
                              <div className="text-xs text-muted-foreground">{booking.SubService}</div>
                            )}
                          </TableCell>
                          <TableCell>₹{booking.price || 0}</TableCell>
                          <TableCell>
                            <StatusBadge status={booking.Status || "pending"}>
                              {booking.Status || "Pending"}
                            </StatusBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="summary" className="mt-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : summary.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No booking summary available for this artist.
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.map(item => (
                        <TableRow key={item.status}>
                          <TableCell>
                            <StatusBadge status={item.status}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>
                            {bookings.length > 0 
                              ? Math.round((item.count / bookings.length) * 100) 
                              : 0}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
