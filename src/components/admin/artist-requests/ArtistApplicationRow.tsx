
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { ArtistApplication } from "@/hooks/useArtistApplications";

interface ArtistApplicationRowProps {
  application: ArtistApplication;
  onViewDetails: (application: ArtistApplication) => void;
  onStatusUpdate: (application: ArtistApplication) => void;
}

export default function ArtistApplicationRow({ 
  application, 
  onViewDetails, 
  onStatusUpdate 
}: ArtistApplicationRowProps) {
  return (
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
      <TableCell>
        <StatusBadge status={application.status || 'pending'} />
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(application)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(application)}
          >
            Update Status
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
