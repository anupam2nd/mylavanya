import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StatusList from "@/components/admin/status/StatusList";
import { StatusOption, useStatusOptions } from "@/hooks/useStatusOptions";
import { useAuth } from "@/context/AuthContext";
import { Search, X, Download, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToCSV } from "@/utils/exportUtils";
import { format } from "date-fns";

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
      
      setStatuses(data || []);
      setFilteredStatuses(data || []);
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
  
  // Export current filtered data to CSV
  const handleExportCSV = () => {
    try {
      // Custom headers for better readability
      const headers = {
        status_code: 'Status Code',
        status_name: 'Status Name',
        description: 'Description',
        active: 'Active',
        id: 'ID'
      };
      
      // Generate timestamp for the filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
      const fileName = `statuses_export_${timestamp}.csv`;
      
      exportToCSV(filteredStatuses, fileName, headers);
      
      toast({
        title: "Export successful",
        description: "Your report has been downloaded",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was a problem creating your report",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['superadmin']}>
      <DashboardLayout title="Status Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>Status List</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center"
                disabled={filteredStatuses.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
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
            
            {/* Filter Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search status codes or names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={activeFilter}
                onValueChange={setActiveFilter}
              >
                <SelectTrigger className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Statuses</SelectItem>
                  <SelectItem value="inactive">Inactive Statuses</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
            
            {loading ? (
              <div className="p-8 flex justify-center items-center">Loading...</div>
            ) : filteredStatuses.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No statuses match your filters. Try adjusting your search criteria.
              </p>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredStatuses.length} of {statuses.length} statuses
                </div>
                <StatusList 
                  statuses={filteredStatuses} 
                  onUpdate={fetchStatuses} 
                  isSuperAdmin={isSuperAdmin} 
                />
              </>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminStatus;
