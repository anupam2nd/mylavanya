import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import ArtistRequestDetailsDialog from "./ArtistRequestDetailsDialog";
import StatusUpdateDialog from "./StatusUpdateDialog";

interface ArtistApplication {
  id: string;
  full_name: string;
  phone_no: string;
  email?: string;
  application_date: string;
  status: string;
  branch_name?: string;
  created_at: string;
}

export default function ArtistRequestsTable() {
  const [selectedRequest, setSelectedRequest] = useState<ArtistApplication | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const { showToast } = useCustomToast();
  const { user, isAuthenticated } = useAuth();

  const { data: applications, isLoading, refetch, error } = useQuery({
    queryKey: ['artist-applications'],
    queryFn: async () => {
      console.log('Fetching artist applications...');
      console.log('Auth user from context:', user);
      console.log('Is authenticated:', isAuthenticated);
      
      // Check both context auth and Supabase auth
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      console.log('Supabase user:', supabaseUser?.id);
      
      if (!isAuthenticated || !user) {
        throw new Error('User not authenticated in context');
      }
      
      if (!supabaseUser) {
        throw new Error('User not authenticated in Supabase');
      }
      
      const { data, error } = await supabase
        .from('ArtistApplication')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artist applications:', error);
        throw error;
      }

      console.log('Fetched applications:', data?.length || 0, 'applications');
      console.log('Sample application data:', data?.[0]);
      return data;
    },
    enabled: isAuthenticated && !!user, // Only run query if authenticated
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      selected: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
    const displayText = status?.replace('_', ' ').toUpperCase() || 'PENDING';

    return (
      <Badge className={`${colorClass} border`}>
        {displayText}
      </Badge>
    );
  };

  const handleViewDetails = (application: ArtistApplication) => {
    setSelectedRequest(application);
    setShowDetailsDialog(true);
  };

  const handleStatusUpdate = (application: ArtistApplication) => {
    setSelectedRequest(application);
    setShowStatusDialog(true);
  };

  const handleStatusUpdateComplete = () => {
    refetch();
    setShowStatusDialog(false);
    setSelectedRequest(null);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-600">
          Please log in to view artist requests.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading artist requests...</div>
      </div>
    );
  }

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-red-600">
          Error loading artist requests: {error.message}
          <br />
          <span className="text-sm">
            User: {user?.email} | Role: {user?.role}
          </span>
          <br />
          <Button 
            onClick={() => refetch()} 
            className="mt-2"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-8 space-y-4">
        <div className="text-lg text-gray-500">No artist requests found.</div>
        <Button 
          onClick={() => refetch()} 
          variant="outline"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.full_name}</TableCell>
                <TableCell>{application.phone_no}</TableCell>
                <TableCell>{application.branch_name || 'N/A'}</TableCell>
                <TableCell>
                  {application.application_date ? 
                    new Date(application.application_date).toLocaleDateString() : 
                    new Date(application.created_at).toLocaleDateString()
                  }
                </TableCell>
                <TableCell>{getStatusBadge(application.status || 'pending')}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(application)}
                    >
                      Update Status
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedRequest && (
        <>
          <ArtistRequestDetailsDialog
            application={selectedRequest}
            isOpen={showDetailsDialog}
            onClose={() => {
              setShowDetailsDialog(false);
              setSelectedRequest(null);
            }}
          />
          <StatusUpdateDialog
            application={selectedRequest}
            isOpen={showStatusDialog}
            onClose={() => setShowStatusDialog(false)}
            onUpdate={handleStatusUpdateComplete}
          />
        </>
      )}
    </>
  );
}
