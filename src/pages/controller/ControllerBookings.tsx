
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminBookings from "../admin/AdminBookings";

const ControllerBookings = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("Controller Bookings rendered, using Admin Bookings functionality");
  }, []);

  // If user is not a controller, redirect to appropriate dashboard
  if (!user || user.role !== 'controller') {
    return <Navigate to="/" />;
  }
  
  // Use the AdminBookings component for controllers
  return (
    <ProtectedRoute allowedRoles={['controller']}>
      <AdminBookings />
    </ProtectedRoute>
  );
};

export default ControllerBookings;
