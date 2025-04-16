
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBookingList } from "./useBookingList";
import { useBookingUpdate } from "./useBookingUpdate";
import { useBookingCRUD } from "./useBookingCRUD";
import { useNewJobDialog } from "./useNewJobDialog";
import { useBookingArtists } from "./useBookingArtists";
import { useAuth } from "@/context/AuthContext";

export const useAdminBookings = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<{ Username?: string, FirstName?: string, LastName?: string } | null>(null);
  const { bookings, setBookings, loading } = useBookingList();
  const { artists } = useBookingArtists();
  const {
    editBooking,
    openDialog,
    setOpenDialog,
    handleEditClick,
    handleSaveWithUserData,
  } = useBookingUpdate(bookings, setBookings);
  const {
    handleDeleteJob,
    handleScheduleChange,
  } = useBookingCRUD(bookings, setBookings);
  const {
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleAddNewJob,
    handleNewJobSuccess,
  } = useNewJobDialog();

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
    handleDeleteJob,
    handleScheduleChange,
    handleAddNewJob,
    showNewJobDialog,
    setShowNewJobDialog,
    selectedBookingForNewJob,
    handleNewJobSuccess,
  };
};
