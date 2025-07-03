
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
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

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['artist-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ArtistApplication')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artist applications:', error);
        throw error;
      }

      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status?.replace('_', ' ').toUpperCase() || 'PENDING'}
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading artist requests...</div>
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
            {applications?.map((application) => (
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
