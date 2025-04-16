import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBookings, Booking } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";
import { useBookingEdit } from "@/hooks/useBookingEdit";
import { useBookingArtists } from "@/hooks/useBookingArtists";
import { useBookingStatusManagement } from "@/hooks/useBookingStatusManagement";
import { useAuth } from "@/context/AuthContext";

export const useAdminBookings = () => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { bookings, setBookings, loading } = useBookings();
  const { artists } = useBookingArtists();
  const { handleStatusChange, handleArtistAssignment } = useBookingStatusManagement();
  
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string, role?: string } | null>(null);
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [selectedBookingForNewJob, setSelectedBookingForNewJob] = useState<Booking | null>(null);
  
  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveChanges
  } = useBookingEdit(bookings, setBookings);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: authSession } = await supabase.auth.getSession();
        
        if (authSession?.session?.user?.id) {
          const userId = authSession.session.user.id;
          
          const { data, error } = await supabase
            .from('UserMST')
            .select('Username, FirstName, LastName, role')
            .eq('id', userId)
            .single();
              
          if (!error && data) {
            console.log("Current user data fetched:", data);
            setCurrentUser(data);
          } else {
            console.error("Error fetching user data:", error);
            if (authUser) {
              setCurrentUser({
                Username: authUser.email?.split('@')[0] || '',
                FirstName: '',
                LastName: '',
                role: authUser.role
              });
            }
          }
        } else {
          console.warn("No active session found");
        }
      } catch (error) {
        console.error('Error in fetchCurrentUser:', error);
      }
    };
    
    fetchCurrentUser();
  }, [authUser]);

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

  const handleSaveWithUserData = (values: any) => {
    console.log("Saving changes with current user:", currentUser);
    
    if (!currentUser) {
      console.warn("No current user data available for booking update");
    }
    
    handleSaveChanges({
      ...values,
      currentUser
    });
  };

  const handleArtistAssignWithUser = async (booking: Booking, artistId: string) => {
    await handleArtistAssignment(booking, artistId);
    
    const bookingIndex = bookings.findIndex(b => b.id === booking.id);
    if (bookingIndex !== -1) {
      const updatedBooking = {
        ...booking,
        ArtistId: artistId,
        Assignedto: artists.find(a => a.ArtistId === artistId)?.ArtistFirstName || 'Artist',
        AssignedBY: currentUser?.FirstName || currentUser?.Username || 'Admin',
        AssingnedON: new Date().toISOString()
      };
      
      const updatedBookings = [...bookings];
      updatedBookings[bookingIndex] = updatedBooking;
      setBookings(updatedBookings);
    }
  };

  const handleDeleteJob = async (booking: Booking) => {
    try {
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', booking.id);

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
      const { error } = await supabase
        .from('BookMST')
        .update({
          Booking_date: date,
          booking_time: time
        })
        .eq('id', booking.id);

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
