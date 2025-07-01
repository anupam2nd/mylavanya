
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface ArtistApplication {
  id: string;
  full_name: string;
  phone_no: string;
  email?: string;
  branch_name?: string;
  application_date?: string;
  status: string;
  created_at: string;
  date_of_birth?: string;
  gender?: string;
  full_address?: string;
  landmark?: string;
  pin_code?: string;
  marital_status?: string;
  guardian_name?: string;
  guardian_contact_no?: string;
  relationship_with_guardian?: string;
  educational_qualification?: string;
  job_type?: string;
  job_experience_years?: number;
  has_job_experience?: boolean;
  other_job_description?: string;
  course_knowledge?: any[];
  trainer_name?: string;
  training_required?: boolean;
  training_requirements?: string;
  trainer_feedback?: string;
  updated_at: string;
}

interface ArtistApplicationDetailsDialogProps {
  application: ArtistApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (applicationId: string, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Artist Application Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace('_', ' ').toUpperCase()}
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
              <Button 
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || selectedStatus === application.status}
                size="sm"
              >
                Update Status
              </Button>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm">{application.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm">{application.phone_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-sm">
                  {application.date_of_birth 
                    ? new Date(application.date_of_birth).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="text-sm">{application.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                <p className="text-sm">{application.marital_status || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Educational Qualification</label>
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
                <label className="text-sm font-medium text-muted-foreground">Full Address</label>
                <p className="text-sm">{application.full_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Landmark</label>
                <p className="text-sm">{application.landmark || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pin Code</label>
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
                <label className="text-sm font-medium text-muted-foreground">Guardian Name</label>
                <p className="text-sm">{application.guardian_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Guardian Contact</label>
                <p className="text-sm">{application.guardian_contact_no || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Relationship with Guardian</label>
                <p className="text-sm">{application.relationship_with_guardian || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Experience</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Has Job Experience</label>
                <p className="text-sm">{application.has_job_experience ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Years of Experience</label>
                <p className="text-sm">{application.job_experience_years || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Job Type</label>
                <p className="text-sm">{application.job_type || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Other Job Description</label>
                <p className="text-sm">{application.other_job_description || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Course Knowledge */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Course Knowledge</h3>
            <div className="text-sm">
              {application.course_knowledge && application.course_knowledge.length > 0 
                ? application.course_knowledge.join(', ')
                : 'N/A'
              }
            </div>
          </div>

          <Separator />

          {/* Training Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Training Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Training Required</label>
                <p className="text-sm">{application.training_required ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Trainer Name</label>
                <p className="text-sm">{application.trainer_name || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Training Requirements</label>
                <p className="text-sm">{application.training_requirements || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Trainer Feedback</label>
                <p className="text-sm">{application.trainer_feedback || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Meta */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Application Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Branch Name</label>
                <p className="text-sm">{application.branch_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                <p className="text-sm">
                  {application.application_date 
                    ? new Date(application.application_date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{new Date(application.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{new Date(application.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistApplicationDetailsDialog;
