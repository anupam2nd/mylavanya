
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Database } from "@/integrations/supabase/types";

// Use the exact type from Supabase database schema
type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface ArtistApplicationsTableProps {
  applications: ArtistApplication[];
  onRowClick: (application: ArtistApplication) => void;
  loading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'under_review':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ArtistApplicationsTable = ({ applications, onRowClick, loading }: ArtistApplicationsTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">Loading applications...</div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">No applications found</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Application Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow
              key={application.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(application)}
            >
              <TableCell className="font-medium">
                {application.full_name}
              </TableCell>
              <TableCell>{application.phone_no}</TableCell>
              <TableCell>{application.branch_name || 'N/A'}</TableCell>
              <TableCell>
                {application.application_date 
                  ? new Date(application.application_date).toLocaleDateString()
                  : 'N/A'
                }
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(application.status || 'pending')}>
                  {(application.status || 'pending').replace('_', ' ').toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArtistApplicationsTable;
