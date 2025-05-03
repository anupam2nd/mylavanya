
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StatusOption } from "@/hooks/useStatusOptions";
import { useAuth } from "@/context/AuthContext";
import StatusFilters from "@/components/admin/status/filters/StatusFilters";
import AdminStatusHeader from "@/components/admin/status/AdminStatusHeader";
import AdminStatusContent from "@/components/admin/status/AdminStatusContent";

const AdminStatus = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [filteredStatuses, setFilteredStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('statusmst')
        .select('*')
        .order('status_code');

      if (error) throw error;
      
      // Transform database results into StatusOption format
      const statusOptions: StatusOption[] = (data || []).map(status => ({
        value: status.status_code, // Add the required value property
        label: status.status_name, // Add the required label property
        status_code: status.status_code,
        status_name: status.status_name,
        description: status.description,
        active: status.active,
        id: status.id
      }));
      
      setStatuses(statusOptions);
      setFilteredStatuses(statusOptions);
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
  
  // Filter statuses based on search query and active filter
  useEffect(() => {
    let result = [...statuses];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        status => 
          status.status_code.toLowerCase().includes(query) ||
          status.status_name.toLowerCase().includes(query) ||
          (status.description && status.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by active status
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter(status => status.active === isActive);
    }
    
    setFilteredStatuses(result);
  }, [statuses, searchQuery, activeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <DashboardLayout title="Status Management">
        <Card>
          <CardHeader>
            <AdminStatusHeader 
              filteredStatuses={filteredStatuses}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
            />
          </CardHeader>
          <CardContent>
            <StatusFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              clearFilters={clearFilters}
            />
            
            <AdminStatusContent
              statuses={statuses}
              filteredStatuses={filteredStatuses}
              loading={loading}
              showAddForm={showAddForm}
              onStatusAdded={() => {
                fetchStatuses();
                setShowAddForm(false);
              }}
              isSuperAdmin={isSuperAdmin}
            />
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminStatus;
