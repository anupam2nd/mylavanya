
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookingData } from "@/components/tracking/BookingDetails";
import UserBookingFilters from './UserBookingFilters';
import { useBookingFilters } from '@/hooks/useBookingFilters';
import { useStatusOptions } from '@/hooks/useStatusOptions';
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

const BookingsList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [artistDetails, setArtistDetails] = useState<Record<number, ArtistDetails>>({});
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        let query = supabase
          .from('BookMST')
          .select('*')
          .order('Booking_date', { ascending: false });
        
        // If the user is an artist, only show bookings assigned to them
        if (user.role === 'artist') {
          const artistId = parseInt(user.id, 10);
          if (!isNaN(artistId)) {
            query = query.eq('ArtistId', artistId);
          }
        } else if (user.role === 'member') {
          // For member users, only show their own bookings
          query = query.eq('email', user.email);
        }
        
        const { data, error } = await query;

        if (error) throw error;

        // Transform the data to match the Booking interface
        const transformedData: Booking[] = (data || []).map(booking => ({
          id: booking.id,
          Booking_NO: String(booking.Booking_NO || ''), // Convert to string
          name: booking.name || '',
          email: booking.email || '',
          Phone_no: booking.Phone_no,
          Booking_date: booking.Booking_date,
          booking_time: booking.booking_time,
          Purpose: booking.Purpose,
          Status: booking.Status || '',
          price: booking.price || 0,
          Address: booking.Address,
          Pincode: booking.Pincode,
          created_at: booking.created_at,
          ArtistId: booking.ArtistId,
          ServiceName: booking.ServiceName,
          SubService: booking.SubService
        }));

        setBookings(transformedData);

        // Fetch artist details for bookings with assigned artists
        const artistIds = transformedData
          .filter(booking => booking.ArtistId)
          .map(booking => booking.ArtistId);

        if (artistIds.length > 0) {
          await fetchArtistDetails([...new Set(artistIds)] as number[]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, navigate]);

  const fetchArtistDetails = async (artistIds: number[]) => {
    try {
      const { data, error } = await supabase
        .from('ArtistMST')
        .select('ArtistId, ArtistFirstName, ArtistLastName, ArtistPhno, emailid')
        .in('ArtistId', artistIds);

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
  
  // Add these new hooks for filtering
  const { statusOptions, formattedStatusOptions } = useStatusOptions();
  const {
    filteredBookings,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    showDateFilter,
    setShowDateFilter,
    filterDateType,
    setFilterDateType,
    sortDirection,
    setSortDirection,
    sortField,
    setSortField,
    clearFilters
  } = useBookingFilters(bookings);
  
  // Determine if user is a member
  const isMember = user?.role === 'member';

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-semibold">{isMember ? "My Bookings" : "Your Bookings"}</h2>
        <UserBookingFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clearFilters={clearFilters}
          statusOptions={formattedStatusOptions}
          showDateFilter={showDateFilter}
          setShowDateFilter={setShowDateFilter}
          filterDateType={filterDateType}
          setFilterDateType={setFilterDateType}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          sortField={sortField}
          setSortField={setSortField}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No bookings found.</p>
          {bookings.length > 0 && filteredBookings.length === 0 && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : isMobile ? (
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
        <Card>
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
        </Card>
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
