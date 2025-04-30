
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileForm from "@/components/profile/ProfileForm";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useProfileData } from "@/hooks/useProfileData";

const Profile = () => {
  const { user } = useAuth();
  const { profileData, isLoading, error } = useProfileData(user);

  return (
    <ProtectedRoute>
      <DashboardLayout title="Profile">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading your profile data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="font-medium">Error loading profile</p>
              <p className="text-sm">{error.message}</p>
            </div>
          ) : (
            <ProfileForm 
              initialData={profileData} 
              userEmail={user?.email || ""} 
              userRole={user?.role} 
              userId={user?.id} 
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Profile;
