
import React, { useState, useEffect } from "react";
import { Booking } from "@/hooks/useBookings";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useBookingArtists, Artist } from "@/hooks/useBookingArtists";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { BookingsFallback } from "./components/BookingsFallback";
import { MemberBookingsList } from "./components/MemberBookingsList";
import { AdminBookingsView } from "./components/AdminBookingsList";
import { BookingEditDialog } from "./components/BookingEditDialog";

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
  const { user } = useAuth();
  const { statusOptions: internalStatusOptions, fetchStatusOptions, handleStatusChange: internalStatusChange, handleArtistAssignment: internalArtistAssignment } = useBookingStatusManagement();
  const { artists: internalArtists } = useBookingArtists();
  
  const isArtist = userRole === "artist" || user?.role === "artist";
  const isMember = userRole === "member" || user?.role === "member";
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'controller';

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

  // Handle edit click
  const handleEditClick = (booking: Booking) => {
    if (!isMember && onEditClick) {
      onEditClick(booking);
    } else {
      setSelectedBooking(booking);
      setIsEditDialogOpen(true);
    }
  };

  const handleDeleteJobWrapper = async (booking: Booking): Promise<void> => {
    if (window.confirm(`Are you sure you want to delete job #${booking.jobno}?`)) {
      await deleteJob(booking);
    }
  };

  const isEmpty = bookings.length === 0;

  return (
    <div className="space-y-6">
      <BookingsFallback loading={loading} isEmpty={isEmpty} />
      
      {!loading && !isEmpty && (
        <>
          {isMember ? (
            <MemberBookingsList 
              primaryBookings={primaryBookings} 
              onViewBooking={onViewBooking} 
            />
          ) : (
            <AdminBookingsView 
              bookingGroups={bookingGroups}
              onEditClick={handleEditClick}
              onDeleteJob={handleDeleteJobWrapper}
              isEditingDisabled={isEditingDisabled}
              handleStatusChange={handleStatusChangeWrapper}
              handleArtistAssignment={handleArtistAssignmentWrapper}
              updateBookingSchedule={updateBookingSchedule}
              statusOptions={statusOptions}
              artists={artists}
              onViewBooking={onViewBooking}
              isMember={isMember}
            />
          )}
        </>
      )}

      <BookingEditDialog 
        selectedBooking={selectedBooking}
        isDialogOpen={isEditDialogOpen}
        setIsDialogOpen={setIsEditDialogOpen}
      />
    </div>
  );
};

export default BookingsList;
