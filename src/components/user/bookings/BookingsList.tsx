
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookingData } from "@/components/tracking/BookingDetails";
import UserBookingFilters from './UserBookingFilters';
import { useBookingFilters } from '@/hooks/useBookingFilters';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { Booking } from '@/hooks/useBookings';

const BookingsList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            console.log("Filtering bookings by ArtistId:", artistId);
            query = query.eq('ArtistId', artistId);
          }
        } else if (user.role === 'member') {
          // For member users, only show their own bookings
          query = query.eq('email', user.email);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        console.log("Bookings fetched:", data?.length || 0);

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
          created_at: booking.created_at
        }));

        setBookings(transformedData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, navigate]);
  
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <Card key={booking.Booking_NO}>
              <CardHeader>
                <CardTitle>{booking.Purpose}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{booking.Booking_date}</span>
                  <Clock className="w-4 h-4 ml-3 mr-1" />
                  <span>{booking.booking_time}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span>Phone: {booking.Phone_no}</span>
                </div>
                <div className={`px-3 py-1 text-xs font-medium rounded-full inline-block
                      ${booking.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.Status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.Status === 'Beautician Assigned' ? 'bg-purple-100 text-purple-800' :
                            booking.Status === 'Done' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'}`}>
                  {booking.Status || 'PENDING'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsList;
