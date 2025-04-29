
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookingData } from "@/components/tracking/BookingDetails";
import { Booking } from '@/hooks/useBookings';
import BookingDetailsModal from "./BookingDetailsModal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArtistDetails {
  ArtistFirstName?: string;
  ArtistLastName?: string;
  ArtistPhno?: number;
  emailid?: string;
}

interface BookingsListProps {
  filteredBookings: Booking[];
  clearFilters: () => void;
}

const BookingsList = ({ filteredBookings, clearFilters }: BookingsListProps) => {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetails>>({});
  const isMobile = useIsMobile();
  
  // Determine if user is a member
  const isMember = user?.role === 'member';

  useEffect(() => {
    // Fetch artist details for bookings with assigned artists
    const fetchArtistDetails = async () => {
      try {
        const artistIds = filteredBookings
          .filter(booking => booking.ArtistId)
          .map(booking => booking.ArtistId);
        
        if (artistIds.length === 0) return;
        
        const uniqueArtistIds = [...new Set(artistIds)] as number[];
        
        const { data, error } = await supabase
          .from('ArtistMST')
          .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistPhno, emailid')
          .in('ArtistId', uniqueArtistIds);

        if (error) throw error;

        const artistMap: Record<number, ArtistDetails> = {};
        data?.forEach(artist => {
          if (artist.ArtistId) {
            artistMap[artist.ArtistId] = {
              ArtistFirstName: artist.ArtistFirstName,
              ArtistLastName: artist.ArtistLastName,
              ArtistPhno: artist.ArtistPhno,
              emailid: artist.emailid
            };
          }
        });

        setArtistDetails(artistMap);
      } catch (error) {
        console.error('Error fetching artist details:', error);
      }
    };

    if (filteredBookings.length > 0) {
      fetchArtistDetails();
    }
  }, [filteredBookings]);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const getArtistName = (artistId?: number) => {
    if (!artistId || !artistDetails[artistId]) return 'Not assigned';
    const artist = artistDetails[artistId];
    return `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() || 'Not available';
  };

  const getArtistPhone = (artistId?: number) => {
    if (!artistId || !artistDetails[artistId]) return '';
    return artistDetails[artistId].ArtistPhno || '';
  };

  // If no bookings found after filtering
  if (filteredBookings.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No bookings found.</p>
        <Button variant="outline" className="mt-4" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isMobile ? (
        // Mobile view - similar to cards but with more details
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.Booking_NO} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{booking.Purpose}</CardTitle>
                <div className="mt-2">
                  <StatusBadge status={booking.Status || 'pending'} />
                </div>
              </CardHeader>
              <div className="p-4 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Date:</p>
                    <p className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {booking.Booking_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time:</p>
                    <p className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {booking.booking_time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking #:</p>
                  <p className="text-sm font-medium">{booking.Booking_NO}</p>
                </div>
                {booking.ArtistId && artistDetails[booking.ArtistId] && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Artist:</p>
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-1" /> {getArtistName(booking.ArtistId)}
                    </p>
                    {getArtistPhone(booking.ArtistId) && (
                      <p className="text-xs flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" /> {getArtistPhone(booking.ArtistId)}
                      </p>
                    )}
                  </div>
                )}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => handleViewDetails(booking)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Desktop view - list format
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Booking #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.Booking_NO} className="group hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="max-w-[250px]">{booking.Purpose}</div>
                  {booking.ServiceName && booking.ServiceName !== booking.Purpose && (
                    <div className="text-xs text-muted-foreground">{booking.ServiceName}</div>
                  )}
                  {booking.SubService && (
                    <div className="text-xs text-muted-foreground">{booking.SubService}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{booking.Booking_date}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{booking.booking_time}</span>
                  </div>
                </TableCell>
                <TableCell>{booking.Booking_NO}</TableCell>
                <TableCell>
                  <StatusBadge status={booking.Status || 'pending'} />
                </TableCell>
                <TableCell>
                  {booking.ArtistId ? (
                    <div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{getArtistName(booking.ArtistId)}</span>
                      </div>
                      {getArtistPhone(booking.ArtistId) && (
                        <div className="flex items-center mt-1">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{getArtistPhone(booking.ArtistId)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(booking)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      <BookingDetailsModal 
        booking={selectedBooking}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </div>
  );
};

export default BookingsList;
