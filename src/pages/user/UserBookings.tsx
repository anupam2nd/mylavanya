
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
  const [userData, setUserData] = useState<{ email_id?: string, FirstName?: string, LastName?: string, role?: string } | null>(null);
  
  // Determine user roles
  const isMember = user?.role === 'member';
  const isArtist = user?.role === 'artist';
  const isController = user?.role === 'controller';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.email) {
        try {
          const { data, error } = await supabase
            .from('UserMST')
            .select('email_id, FirstName, LastName, role')
            .eq('email_id', user.email)
            .single();
            
          if (error) {
            // Fall back to auth context data
            setUserData({
              email_id: user.email,
              FirstName: '',
              LastName: '',
              role: user.role
            });
          } else if (data) {
            setUserData(data);
          }
        } catch (err) {
          // Error handled silently
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  // Use userData (from UserMST) if available, otherwise fall back to currentUser
  const effectiveUserData = userData || currentUser;

  // Only used for admin-level roles (admin, superadmin, controller)
  const { dialogs, handleEditClick, handleAddNewJob } = (isAdmin || isController) && !isMember && !isArtist ? 
    BookingDialogs({ bookings, setBookings, currentUser: effectiveUserData }) : 
    { dialogs: null, handleEditClick: () => {}, handleAddNewJob: () => {} };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Booking Management">
        <div className="p-2 sm:p-4 md:p-6">
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

          {(isAdmin || isController) && !isMember && !isArtist && dialogs}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserBookings;
