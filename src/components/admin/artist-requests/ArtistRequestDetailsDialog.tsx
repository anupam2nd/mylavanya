
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ArtistApplication {
  id: string;
  full_name: string;
  phone_no: string;
  email?: string;
  application_date: string;
  status: string;
  branch_name?: string;
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
  course_knowledge?: string[];
  trainer_name?: string;
  training_required?: boolean;
  training_requirements?: string;
  trainer_feedback?: string;
  created_at: string;
}

interface ArtistRequestDetailsDialogProps {
  application: ArtistApplication;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtistRequestDetailsDialog({
  application,
  isOpen,
  onClose,
}: ArtistRequestDetailsDialogProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            Artist Application Details
            {getStatusBadge(application.status || 'pending')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm">{application.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm">{application.phone_no}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Branch Name</label>
                <p className="text-sm">{application.branch_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Application Date</label>
                <p className="text-sm">
                  {application.application_date ? 
                    new Date(application.application_date).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-sm">
                  {application.date_of_birth ? 
                    new Date(application.date_of_birth).toLocaleDateString() : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-sm">{application.gender || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Full Address</label>
                <p className="text-sm">{application.full_address || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Landmark</label>
                <p className="text-sm">{application.landmark || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pin Code</label>
                <p className="text-sm">{application.pin_code || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Marital Status</label>
                <p className="text-sm">{application.marital_status || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Educational Qualification</label>
                <p className="text-sm">{application.educational_qualification || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Guardian Information */}
          {(application.guardian_name || application.guardian_contact_no) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guardian Name</label>
                    <p className="text-sm">{application.guardian_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Guardian Contact</label>
                    <p className="text-sm">{application.guardian_contact_no || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Relationship</label>
                    <p className="text-sm">{application.relationship_with_guardian || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Job Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Has Experience</label>
                <p className="text-sm">{application.has_job_experience ? 'Yes' : 'No'}</p>
              </div>
              {application.has_job_experience && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Job Type</label>
                    <p className="text-sm">{application.job_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                    <p className="text-sm">{application.job_experience_years || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
            {application.other_job_description && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Other Job Description</label>
                <p className="text-sm">{application.other_job_description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Course Knowledge */}
          {application.course_knowledge && application.course_knowledge.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3">Course Knowledge</h3>
                <div className="flex flex-wrap gap-2">
                  {application.course_knowledge.map((course, index) => (
                    <Badge key={index} variant="secondary">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Training Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Training Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Trainer Name</label>
                <p className="text-sm">{application.trainer_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Training Required</label>
                <p className="text-sm">{application.training_required ? 'Yes' : 'No'}</p>
              </div>
            </div>
            {application.training_requirements && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Training Requirements</label>
                <p className="text-sm">{application.training_requirements}</p>
              </div>
            )}
            {application.trainer_feedback && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-500">Trainer Feedback</label>
                <p className="text-sm">{application.trainer_feedback}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
