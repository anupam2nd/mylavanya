
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useUserBookings } from "@/hooks/useUserBookings";
import MemberBookingsView from "@/components/user/bookings/MemberBookingsView";
import AdminBookingsView from "@/components/user/bookings/AdminBookingsView";
import BookingDialogs from "@/components/user/bookings/BookingDialogs";

const UserBookings = () => {
  const { user } = useAuth();
  const { bookings, setBookings, loading, currentUser } = useUserBookings();
  
  console.log("UserBookings - Current bookings:", bookings);
  
  // Determine user roles
  const isMember = user?.role === 'member';
  const isArtist = user?.role === 'artist';

  // Only used for non-member, non-artist roles
  const { dialogs, handleEditClick, handleAddNewJob } = !isMember && !isArtist ? 
    BookingDialogs({ bookings, setBookings, currentUser }) : 
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
