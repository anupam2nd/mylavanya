
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useUserBookings } from "@/hooks/useUserBookings";
import MemberBookingsView from "@/components/user/bookings/MemberBookingsView";
import AdminBookingsView from "@/components/user/bookings/AdminBookingsView";
import BookingDialogs from "@/components/user/bookings/BookingDialogs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const UserBookings = () => {
  const { user } = useAuth();
  const { bookings, setBookings, loading, currentUser } = useUserBookings();
  const [userData, setUserData] = useState<{ Username?: string, FirstName?: string, LastName?: string, role?: string } | null>(null);
  
  console.log("UserBookings - Current bookings:", bookings);
  
  // Determine user roles
  const isMember = user?.role === 'member';
  const isArtist = user?.role === 'artist';

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from('UserMST')
            .select('Username, FirstName, LastName, role')
            .eq('Username', user.email)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            // Fall back to auth context data
            setUserData({
              Username: user.email,
              FirstName: '',
              LastName: '',
              role: user.role
            });
          } else if (data) {
            console.log("Found user data in UserMST:", data);
            setUserData(data);
          }
        } catch (err) {
          console.error("Error in fetchUserData:", err);
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  // Use userData (from UserMST) if available, otherwise fall back to currentUser
  const effectiveUserData = userData || currentUser;
  console.log("Effective user data for BookingDialogs:", effectiveUserData);

  // Only used for non-member, non-artist roles
  const { dialogs, handleEditClick, handleAddNewJob } = !isMember && !isArtist ? 
    BookingDialogs({ bookings, setBookings, currentUser: effectiveUserData }) : 
    { dialogs: null, handleEditClick: () => {}, handleAddNewJob: () => {} };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Booking Management">
        {isMember ? (
          <MemberBookingsView 
            bookings={bookings} 
            loading={loading} 
          />
        ) : (
          <AdminBookingsView 
            bookings={bookings} 
            loading={loading} 
            onEditClick={handleEditClick} 
            onAddNewJob={handleAddNewJob}
            isArtist={isArtist}
          />
        )}

        {!isMember && !isArtist && dialogs}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserBookings;
