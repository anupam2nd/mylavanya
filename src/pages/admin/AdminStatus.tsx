
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StatusList from "@/components/admin/status/StatusList";
import AddStatusForm from "@/components/admin/status/AddStatusForm";
import { StatusOption } from "@/hooks/useStatusOptions";

const AdminStatus = () => {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);

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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Status List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 flex justify-center items-center">Loading...</div>
              ) : (
                <StatusList statuses={statuses} onUpdate={fetchStatuses} />
              )}
            </CardContent>
          </Card>
          
          <div className="md:col-span-2">
            <AddStatusForm onStatusAdded={fetchStatuses} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminStatus;
