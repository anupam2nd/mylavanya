
import React, { useState, useEffect } from "react";
import { Booking } from "@/hooks/useBookings";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useBookingArtists, Artist } from "@/hooks/useBookingArtists";
import { JobsTable } from "./booking-table/JobsTable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { BookingDetailRow } from "./booking-table/BookingDetailRow";
import EditBookingDialog from "./EditBookingDialog"; 
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface BookingsListProps {
  customBookings?: Booking[];
  customLoading?: boolean;
  userRole?: string;
  onViewBooking?: (booking: Booking) => void;
}

const BookingsList = ({
  customBookings,
  customLoading,
  userRole = "user",
  onViewBooking
}: BookingsListProps) => {
  const { statusOptions, fetchStatusOptions, handleStatusChange, handleArtistAssignment } = useBookingStatusManagement();
  const { artists } = useBookingArtists();
  const { user } = useAuth();
  const isArtist = userRole === "artist" || user?.role === "artist";

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const bookingGroups = bookings.reduce((groups: Record<string, Booking[]>, booking) => {
    const key = booking.Booking_NO || '';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(booking);
    return groups;
  }, {});

  useEffect(() => {
    fetchStatusOptions();
  }, []);

  useEffect(() => {
    if (customBookings !== undefined) {
      setBookings(customBookings);
      setLoading(customLoading || false);
    }
  }, [customBookings, customLoading]);

  const handleStatusChangeWrapper = async (booking: Booking, newStatus: string) => {
    await handleStatusChange(booking, newStatus);
    
    setBookings(prevBookings => 
      prevBookings.map(b => b.id === booking.id ? { ...b, Status: newStatus } : b)
    );
  };

  const handleArtistAssignmentWrapper = async (booking: Booking, artistId: string) => {
    try {
      await handleArtistAssignment(booking, artistId);
    
      const artist = artists.find(a => a.ArtistId === artistId);
      if (artist) {
        const artistName = `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim();
        setBookings(prevBookings => 
          prevBookings.map(b => b.id === booking.id ? { ...b, ArtistId: artistId, Assignedto: artistName } : b)
        );
      }
    } catch (error) {
      console.error("Error assigning artist:", error);
    }
  };

  const updateBookingSchedule = async (booking: Booking, date: string, time: string): Promise<void> => {
    try {
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          Booking_date: date, 
          booking_time: time 
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === booking.id ? { ...b, Booking_date: date, booking_time: time } : b)
      );
    } catch (error) {
      console.error("Error updating booking schedule:", error);
    }
  };

  const deleteJob = async (booking: Booking): Promise<void> => {
    try {
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      
      setBookings(prevBookings => 
        prevBookings.filter(b => b.id !== booking.id)
      );
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleViewBookingClick = (booking: Booking) => {
    if (onViewBooking) {
      onViewBooking(booking);
    }
  };

  const handleDeleteJobWrapper = async (booking: Booking): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete job #${booking.jobno}?`)) {
      await deleteJob(booking);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(bookingGroups).map(([bookingNo, bookingsGroup]) => (
            <div key={bookingNo} className="border rounded-lg overflow-hidden">
              <BookingDetailRow 
                booking={bookingsGroup[0]} 
                onEdit={isArtist ? undefined : handleEditClick}  // Hide edit for artists
                onView={onViewBooking ? handleViewBookingClick : undefined}
              />
              <JobsTable 
                bookingsGroup={bookingsGroup}
                onEditClick={isArtist ? undefined : handleEditClick}  // Hide edit for artists
                onDeleteJob={!isArtist && deleteJob ? handleDeleteJobWrapper : undefined} // Hide delete for artists
                isEditingDisabled={isArtist}  // Disable editing for artists
                handleStatusChange={handleStatusChangeWrapper}
                handleArtistAssignment={handleArtistAssignmentWrapper}
                onScheduleChange={updateBookingSchedule}
                statusOptions={statusOptions}
                artists={artists}
              />
            </div>
          ))}
        </div>
      )}

      {selectedBooking && !isArtist && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditBookingDialog 
            booking={selectedBooking}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </Dialog>
      )}
    </div>
  );
};

export default BookingsList;
