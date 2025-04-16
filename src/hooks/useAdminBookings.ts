import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBookingArtists, Artist } from "@/hooks/useBookingArtists";
import { Booking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";

export const useAdminBookings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string } | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { artists } = useBookingArtists();
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const userId = authSession.session.user.id;
          
          const { data, error } = await supabase
            .from('UserMST')
            .select('Username, FirstName, LastName')
            .eq('id', userId)
            .single();
              
          if (!error && data) {
            setCurrentUser(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('BookMST')
          .select('*, uuid')
          .order('Booking_date', { ascending: false });

        if (error) throw error;
        
        const formattedBookings = data?.map(booking => ({
          ...booking,
          id: booking.id.toString(),
          ArtistId: booking.ArtistId ? booking.ArtistId.toString() : undefined,
          Product: booking.Product ? booking.Product.toString() : undefined
        })) || [];
        
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Failed to load bookings",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setOpenDialog(true);
  };

  const handleSaveWithUserData = async (formValues: any) => {
    try {
      if (!editBooking) return;
      
      const { date, time, status, address, pincode, artistId } = formValues;
      
      const updates: any = {};
      
      if (date) updates.Booking_date = new Date(date).toISOString().split('T')[0];
      if (time) updates.booking_time = time;
      if (status) updates.Status = status;
      if (address !== undefined) updates.Address = address;
      if (pincode !== undefined) updates.Pincode = pincode ? parseInt(pincode) : null;
      
      if (artistId !== undefined) {
        if (artistId) {
          updates.ArtistId = artistId;
          
          const artist = artists.find(a => a.ArtistId === artistId);
          updates.Assignedto = artist ? 
            `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() 
            : `Artist #${artistId}`;
          updates.AssignedBY = formValues.currentUser?.Username || currentUser?.Username || 'admin';
          updates.AssingnedON = new Date().toISOString();
        } else {
          updates.ArtistId = null;
          updates.Assignedto = null;
        }
      }

      const { error } = await supabase
        .from('BookMST')
        .update(updates)
        .eq('id', editBooking.id);

      if (error) throw error;
      
      const updatedBookings = bookings.map(b => 
        b.id === editBooking.id ? { ...b, ...updates } : b
      );
      
      setBookings(updatedBookings);
      
      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        variant: "destructive",
        title: "Failed to update booking",
        description: "An error occurred while updating the booking",
      });
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .update({ 
          Status: newStatus,
          StatusUpdated: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: error.message,
        });
        return;
      }

      const updatedBookings = bookings.map(b => 
        b.id === booking.id ? { ...b, Status: newStatus } : b
      );
      
      setBookings(updatedBookings);

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

  const handleArtistAssignWithUser = async (booking: Booking, artistId: string) => {
    try {
      if (!artistId) throw new Error("Invalid artist ID");
      
      const artist = artists.find(a => a.ArtistId === artistId);
      const artistName = artist 
        ? `${artist.ArtistFirstName || ''} ${artist.ArtistLastName || ''}`.trim() 
        : `Artist #${artistId}`;
      
      const { error } = await supabase
        .from('BookMST')
        .update({
          ArtistId: artistId,
          Assignedto: artistName,
          AssignedBY: currentUser?.FirstName || currentUser?.Username || 'Admin',
          AssingnedON: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (error) throw error;
      
      const updatedBookings = bookings.map(b => 
        b.id === booking.id 
          ? { 
              ...b, 
              ArtistId: artistId, 
              Assignedto: artistName,
              AssignedBY: currentUser?.FirstName || currentUser?.Username || 'Admin',
              AssingnedON: new Date().toISOString()
            } 
          : b
      );
      
      setBookings(updatedBookings);
      
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

  const handleDeleteJob = async (booking: Booking) => {
    try {
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', bookingIdNumber);

      if (error) throw error;
      setBookings(bookings.filter(b => b.id !== booking.id));
      
      toast({
        title: "Job deleted",
        description: `Job #${booking.jobno} has been deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        variant: "destructive",
        title: "Error deleting job",
        description: "An error occurred while trying to delete the job",
      });
    }
  };

  const handleScheduleChange = async (booking: Booking, date: string, time: string) => {
    try {
      const bookingIdNumber = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .update({
          Booking_date: date,
          booking_time: time
        })
        .eq('id', bookingIdNumber);

      if (error) throw error;
      const updatedBookings = bookings.map(b => 
        b.id === booking.id 
          ? { ...b, Booking_date: date, booking_time: time } 
          : b
      );
      setBookings(updatedBookings);
      toast({
        title: "Schedule updated",
        description: `Booking schedule has been updated to ${date} at ${time}`,
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error updating schedule",
        description: "An error occurred while trying to update the schedule",
      });
    }
  };

  const handleAddNewJob = (booking: Booking) => {
    setSelectedBookingForNewJob(booking);
    setShowNewJobDialog(true);
  };

  const handleNewJobSuccess = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
    setShowNewJobDialog(false);
    
    toast({
      title: "Success!",
      description: "New job has been added to this booking",
    });
  };

  return { 
    bookings, 
    loading, 
    currentUser,
    artists,
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveWithUserData,
    handleStatusChange,
    handleArtistAssignWithUser,
    handleDeleteJob,
    handleScheduleChange,
    handleAddNewJob,
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleNewJobSuccess
  };
};
