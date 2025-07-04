
import { useState } from "react";
import { useCustomToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ArtistRequestDetailsDialog from "./ArtistRequestDetailsDialog";
import StatusUpdateDialog from "./StatusUpdateDialog";
import ArtistApplicationRow from "./ArtistApplicationRow";
import { useArtistApplications, ArtistApplication } from "@/hooks/useArtistApplications";

export default function ArtistRequestsTable() {
  const [selectedRequest, setSelectedRequest] = useState<ArtistApplication | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const { showToast } = useCustomToast();
  const { user, isAuthenticated } = useAuth();
  
  const { data: applications, isLoading, refetch, error } = useArtistApplications();

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
              <ArtistApplicationRow
                key={application.id}
                application={application}
                onViewDetails={handleViewDetails}
                onStatusUpdate={handleStatusUpdate}
              />
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
