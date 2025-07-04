
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import ArtistApplicationsTable from "@/components/admin/artist-applications/ArtistApplicationsTable";
import ArtistApplicationDetailsDialog from "@/components/admin/artist-applications/ArtistApplicationDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

// Use the exact type from Supabase database schema
type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

const AdminArtistApplications = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ArtistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ArtistApplication')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching artist applications:', error);
      toast({
        title: "Failed to load applications",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (application: ArtistApplication) => {
    setSelectedApplication(application);
    setIsDetailsDialogOpen(true);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ArtistApplication')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;

      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, updated_at: new Date().toISOString() }
            : app
        )
      );

      toast({
        title: "Status updated successfully",
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "controller"]}>
      <DashboardLayout title="New Artist Applicants">
        <Card>
          <CardHeader>
            <CardTitle>Artist Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              Total applications: {applications.length}
            </div>

            <ArtistApplicationsTable
              applications={applications}
              onRowClick={handleRowClick}
              loading={loading}
            />
          </CardContent>
        </Card>

        <ArtistApplicationDetailsDialog
          application={selectedApplication}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onStatusUpdate={handleStatusUpdate}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminArtistApplications;
