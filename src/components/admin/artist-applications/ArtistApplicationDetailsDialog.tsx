
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Database } from "@/integrations/supabase/types";

// Use the exact type from Supabase database schema
type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface ArtistApplicationDetailsDialogProps {
  application: ArtistApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (applicationId: string, newStatus: string) => void;
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

const ArtistApplicationDetailsDialog = ({
  application,
  open,
  onOpenChange,
  onStatusUpdate
}: ArtistApplicationDetailsDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  if (!application) return null;

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== application.status) {
      onStatusUpdate(application.id, selectedStatus);
      setSelectedStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Artist Application Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge className={getStatusColor(application.status || 'pending')}>
                {(application.status || 'pending').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
              <Button onClick={handleStatusUpdate} disabled={!selectedStatus}>
                Update
              </Button>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-sm">{application.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-sm">{application.phone_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-sm">{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-sm">{application.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Marital Status</label>
                <p className="text-sm">{application.marital_status || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Educational Qualification</label>
                <p className="text-sm">{application.educational_qualification || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Address Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Full Address</label>
                <p className="text-sm">{application.full_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Landmark</label>
                <p className="text-sm">{application.landmark || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Pin Code</label>
                <p className="text-sm">{application.pin_code || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Guardian Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Guardian Name</label>
                <p className="text-sm">{application.guardian_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Guardian Contact</label>
                <p className="text-sm">{application.guardian_contact_no || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Relationship with Guardian</label>
                <p className="text-sm">{application.relationship_with_guardian || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Job Type</label>
                <p className="text-sm">{application.job_type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Has Job Experience</label>
                <p className="text-sm">{application.has_job_experience ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Job Experience (Years)</label>
                <p className="text-sm">{application.job_experience_years || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Other Job Description</label>
                <p className="text-sm">{application.other_job_description || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Training Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Training Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Training Required</label>
                <p className="text-sm">{application.training_required ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Trainer Name</label>
                <p className="text-sm">{application.trainer_name || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Training Requirements</label>
                <p className="text-sm">{application.training_requirements || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Trainer Feedback</label>
                <p className="text-sm">{application.trainer_feedback || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Application Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Branch Name</label>
                <p className="text-sm">{application.branch_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Application Date</label>
                <p className="text-sm">{application.application_date ? new Date(application.application_date).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created At</label>
                <p className="text-sm">{new Date(application.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-sm">{new Date(application.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Course Knowledge */}
          {application.course_knowledge && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Course Knowledge</h3>
                <div className="text-sm">
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(application.course_knowledge, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistApplicationDetailsDialog;
