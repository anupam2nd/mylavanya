
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit, ChevronDown, ChevronUp, MapPin, Phone, Plus, Check } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  onEditClick: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
}

interface GroupedBookings {
  [key: string]: Booking[];
}

interface Artist {
  ArtistId: number;
  ArtistFirstName: string;
  ArtistLastName: string;
}

const AdminBookingsList = ({ bookings, loading, onEditClick, onAddNewJob }: BookingsListProps) => {
  const [expandedBookings, setExpandedBookings] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [statusOptions, setStatusOptions] = useState<{status_code: string; status_name: string}[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch artists from ArtistMST
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName')
          .eq('Active', true);

        if (error) {
          console.error("Error fetching artists:", error);
          return;
        }

        setArtists(data || []);
      } catch (error) {
        console.error("Error in fetchArtists:", error);
      }
    };

    // Fetch status options
    const fetchStatusOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('statusmst')
          .select('status_code, status_name')
          .eq('active', true);

        if (error) {
          console.error("Error fetching status options:", error);
          return;
        }

        setStatusOptions(data || []);
      } catch (error) {
        console.error("Error in fetchStatusOptions:", error);
      }
    };

    fetchArtists();
    fetchStatusOptions();
  }, []);

  const toggleBooking = (bookingNo: string) => {
    setExpandedBookings(prev => 
      prev.includes(bookingNo) 
        ? prev.filter(id => id !== bookingNo) 
        : [...prev, bookingNo]
    );
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({ Status: newStatus, StatusUpdated: new Date().toISOString() })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: "An unexpected error occurred",
      });
    }
  };

  const handleArtistAssignment = async (booking: Booking, artistId: number) => {
    try {
      // Find the selected artist
      const selectedArtist = artists.find(artist => artist.ArtistId === artistId);
      if (!selectedArtist) return;

      const artistName = `${selectedArtist.ArtistFirstName || ''} ${selectedArtist.ArtistLastName || ''}`.trim();
      
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          ArtistId: artistId,
          Assignedto: artistName,
          AssingnedON: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to assign artist",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Artist assigned",
        description: `Booking assigned to ${artistName}`,
      });
    } catch (error) {
      console.error("Error assigning artist:", error);
      toast({
        variant: "destructive",
        title: "Error assigning artist",
        description: "An unexpected error occurred",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  // Group bookings by Booking_NO
  const groupedBookings: GroupedBookings = bookings.reduce((acc, booking) => {
    const bookingNo = booking.Booking_NO || 'unknown';
    if (!acc[bookingNo]) {
      acc[bookingNo] = [];
    }
    acc[bookingNo].push(booking);
    return acc;
  }, {} as GroupedBookings);

  // Check if the onEditClick is a no-op function (used for artists who shouldn't edit)
  const isEditingDisabled = onEditClick.toString() === (() => {}).toString();

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking No.</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Creation Date</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(groupedBookings).map(([bookingNo, bookingsGroup]) => {
            // Use the first booking in the group for the main row details
            const mainBooking = bookingsGroup[0];
            const isExpanded = expandedBookings.includes(bookingNo);
            
            return (
              <React.Fragment key={bookingNo}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">{bookingNo}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{mainBooking.name || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">{mainBooking.email || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                      {mainBooking.Phone_no || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {mainBooking.created_at ? 
                      format(new Date(mainBooking.created_at), 'MMM dd, yyyy') : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>{mainBooking.Purpose}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                        {mainBooking.Address || 'N/A'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {mainBooking.Pincode ? `PIN: ${mainBooking.Pincode}` : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleBooking(bookingNo)}
                      className="h-8 p-0 w-8"
                    >
                      {isExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                      <span className="sr-only">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                    </Button>
                  </TableCell>
                </TableRow>
                
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-0 border-t-0">
                      <div className="bg-muted/20 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">Service Details</h4>
                          {onAddNewJob && !isEditingDisabled && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onAddNewJob(mainBooking)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add New Job
                            </Button>
                          )}
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Job No.</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Date & Time</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Assigned To</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bookingsGroup.map((booking) => (
                              <TableRow key={`${booking.id}-${booking.jobno}`} className="hover:bg-white/50">
                                <TableCell>
                                  {booking.jobno ? 
                                    `JOB-${booking.jobno.toString().padStart(3, '0')}` : 
                                    'N/A'
                                  }
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{booking.ProductName || 'N/A'}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {[
                                        booking.ServiceName, 
                                        booking.SubService
                                      ].filter(Boolean).join(' > ')}
                                    </span>
                                    <span className="text-xs">
                                      Qty: {booking.Qty || 1}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                      {booking.Booking_date}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                      {booking.booking_time}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <StatusBadge status={booking.Status || 'pending'} />
                                    {!isEditingDisabled && (
                                      <Select
                                        onValueChange={(value) => handleStatusChange(booking, value)}
                                        defaultValue={booking.Status || 'pending'}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue placeholder="Change Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {statusOptions.map((option) => (
                                            <SelectItem 
                                              key={option.status_code} 
                                              value={option.status_code}
                                            >
                                              {option.status_name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <div>{booking.Assignedto || 'Not assigned'}</div>
                                    {!isEditingDisabled && (
                                      <Select
                                        onValueChange={(value) => handleArtistAssignment(booking, parseInt(value))}
                                      >
                                        <SelectTrigger className="h-7 text-xs">
                                          <SelectValue placeholder="Assign Artist" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {artists.map((artist) => (
                                            <SelectItem 
                                              key={artist.ArtistId} 
                                              value={artist.ArtistId.toString()}
                                            >
                                              {`${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || `Artist #${artist.ArtistId}`}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => onEditClick(booking)}
                                    className="h-8"
                                    disabled={isEditingDisabled}
                                  >
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminBookingsList;
