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

const BookingsList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingData[]>([]);
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
        const { data, error } = await supabase
          .from('BookMST')
          .select('*')
          .eq('email', user.email)
          .order('Booking_date', { ascending: false });

        if (error) throw error;

        // Transform the data to match the BookingData interface
        const transformedData = data?.map(booking => ({
          ...booking,
          ProductName: booking.Purpose // Use Purpose as ProductName since it's required
        })) || [];

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
  const { statusOptions } = useStatusOptions();
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
    clearFilters
  } = useBookingFilters(bookings);
  
  // Replace any occurrences of 'bookings' with 'filteredBookings' in the existing component
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-semibold">Your Bookings</h2>
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
          statusOptions={statusOptions}
          showDateFilter={showDateFilter}
          setShowDateFilter={setShowDateFilter}
          filterDateType={filterDateType}
          setFilterDateType={setFilterDateType}
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
                <div className={`px-3 py-1 text-xs font-medium rounded-full inline-block
                      ${booking.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.Status === 'beautician_assigned' ? 'bg-purple-100 text-purple-800' :
                            booking.Status === 'done' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'}`}>
                  {booking.Status?.toUpperCase() || 'PENDING'}
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
