
import React, { useState, useEffect } from "react";
import { Booking } from "@/hooks/useBookings";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useBookingArtists, Artist } from "@/hooks/useBookingArtists";
import { JobsTable } from "./booking-table/JobsTable";
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
  onEditClick?: (booking: Booking) => void;
  onAddNewJob?: (booking: Booking) => void;
  statusOptions?: {status_code: string; status_name: string}[];
  artists?: Artist[];
  handleStatusChange?: (booking: Booking, newStatus: string) => Promise<void>;
  handleArtistAssignment?: (booking: Booking, artistId: string) => Promise<void>;
  isEditingDisabled?: boolean;
  onDeleteJob?: (booking: Booking) => Promise<void>;
  onScheduleChange?: (booking: Booking, date: string, time: string) => Promise<void>;
  onViewBooking?: (booking: Booking) => void;
}

const BookingsList = ({
  customBookings,
  customLoading,
  userRole = "user",
  onEditClick,
  onAddNewJob,
  statusOptions: externalStatusOptions,
  artists: externalArtists,
  handleStatusChange: externalStatusChange,
  handleArtistAssignment: externalArtistAssignment,
  isEditingDisabled: externalEditingDisabled,
  onDeleteJob: externalDeleteJob,
  onScheduleChange: externalScheduleChange,
  onViewBooking
}: BookingsListProps) => {
  const { statusOptions: internalStatusOptions, fetchStatusOptions, handleStatusChange: internalStatusChange, handleArtistAssignment: internalArtistAssignment } = useBookingStatusManagement();
  const { artists: internalArtists } = useBookingArtists();
  const { user } = useAuth();
  const isArtist = userRole === "artist" || user?.role === "artist";
  const isMember = userRole === "member" || user?.role === "member";

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Use external props if provided, otherwise use internal state
  const statusOptions = externalStatusOptions || internalStatusOptions;
  const artists = externalArtists || internalArtists;
  const isEditingDisabled = externalEditingDisabled !== undefined ? externalEditingDisabled : (isArtist || isMember);

  // Group bookings by Booking_NO
  const bookingGroups = bookings.reduce((groups: Record<string, Booking[]>, booking) => {
    const key = booking.Booking_NO || '';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(booking);
    return groups;
  }, {});

  // For members, we need to create a unique set of primary bookings (one per Booking_NO)
  const primaryBookings = isMember ? 
    Object.values(bookingGroups).map(group => ({
      ...group[0],
      serviceCount: group.length
    })) : 
    bookings;

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
    if (externalStatusChange) {
      await externalStatusChange(booking, newStatus);
    } else {
      await internalStatusChange(booking, newStatus);
      
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === booking.id ? { ...b, Status: newStatus } : b)
      );
    }
  };

  const handleArtistAssignmentWrapper = async (booking: Booking, artistId: string) => {
    try {
      if (externalArtistAssignment) {
        await externalArtistAssignment(booking, artistId);
      } else {
        await internalArtistAssignment(booking, artistId);
      
        const artist = artists.find(a => a.ArtistId === artistId);
        if (artist) {
          const artistName = `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim();
          setBookings(prevBookings => 
            prevBookings.map(b => b.id === booking.id ? { ...b, ArtistId: artistId, Assignedto: artistName } : b)
          );
        }
      }
    } catch (error) {
      console.error("Error assigning artist:", error);
    }
  };

  const updateBookingSchedule = async (booking: Booking, date: string, time: string): Promise<void> => {
    if (externalScheduleChange) {
      return externalScheduleChange(booking, date, time);
    }
    
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
    if (externalDeleteJob) {
      return externalDeleteJob(booking);
    }
    
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
    if (onEditClick) {
      onEditClick(booking);
    } else {
      setSelectedBooking(booking);
      setIsEditDialogOpen(true);
    }
  };

  const handleAddNewJob = (booking: Booking) => {
    if (onAddNewJob) {
      onAddNewJob(booking);
    }
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
      ) : isMember ? (
        // Member view - show one row per booking number with a View button
        <div className="space-y-6">
          {primaryBookings.map((booking: any) => (
            <div key={booking.Booking_NO} className="border rounded-lg overflow-hidden">
              <BookingDetailRow 
                booking={booking} 
                onView={onViewBooking ? handleViewBookingClick : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        // Default view for other roles
        <div className="space-y-6">
          {Object.entries(bookingGroups).map(([bookingNo, bookingsGroup]) => (
            <div key={bookingNo} className="border rounded-lg overflow-hidden">
              <BookingDetailRow 
                booking={bookingsGroup[0]} 
                onEdit={isArtist ? undefined : handleEditClick}
                onView={onViewBooking ? handleViewBookingClick : undefined}
              />
              <JobsTable 
                bookingsGroup={bookingsGroup}
                onEditClick={isArtist ? undefined : handleEditClick}
                onDeleteJob={!isArtist && deleteJob ? handleDeleteJobWrapper : undefined}
                isEditingDisabled={isEditingDisabled}
                handleStatusChange={handleStatusChangeWrapper}
                handleArtistAssignment={handleArtistAssignmentWrapper}
                onScheduleChange={updateBookingSchedule}
                statusOptions={statusOptions}
                artists={artists}
                onViewBooking={onViewBooking}
                showActions={!isMember}
              />
            </div>
          ))}
        </div>
      )}

      {selectedBooking && !isEditingDisabled && (
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
