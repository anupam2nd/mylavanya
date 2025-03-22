
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StatusList from "@/components/admin/status/StatusList";
import AddStatusForm from "@/components/admin/status/AddStatusForm";
import { StatusOption } from "@/hooks/useStatusOptions";
import { useAuth } from "@/context/AuthContext";

const AdminStatus = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin';

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('statusmst')
        .select('*')
        .order('status_code');

      if (error) throw error;
      
      setStatuses(data || []);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      toast({
        title: "Failed to load statuses",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <DashboardLayout title="Status Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Status List</CardTitle>
            <div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
              >
                {showAddForm ? 'Hide Form' : 'Add New Status'}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <AddStatusForm onStatusAdded={() => {
                  fetchStatuses();
                  setShowAddForm(false);
                }} />
              </div>
            )}
            
            {loading ? (
              <div className="p-8 flex justify-center items-center">Loading...</div>
            ) : (
              <StatusList 
                statuses={statuses} 
                onUpdate={fetchStatuses} 
                isSuperAdmin={isSuperAdmin} 
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminStatus;
