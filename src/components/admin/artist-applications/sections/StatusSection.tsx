
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface StatusSectionProps {
  application: ArtistApplication;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onStatusUpdate: () => void;
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

export const StatusSection = ({ application, selectedStatus, onStatusChange, onStatusUpdate }: StatusSectionProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <Badge className={getStatusColor(application.status || 'pending')}>
          {(application.status || 'pending').replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onStatusUpdate} disabled={!selectedStatus}>
          Update
        </Button>
      </div>
    </div>
  );
};
