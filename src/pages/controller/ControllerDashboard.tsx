
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminDashboard from "../admin/AdminDashboard";

const ControllerDashboard = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("Controller Dashboard rendered, using Admin Dashboard functionality");
  }, []);

  // If user is not a controller, redirect to appropriate dashboard
  if (!user || user.role !== 'controller') {
    return <Navigate to="/" />;
  }
  
  // Use the AdminDashboard component for controllers
  return (
    <ProtectedRoute allowedRoles={['controller']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
};

export default ControllerDashboard;
