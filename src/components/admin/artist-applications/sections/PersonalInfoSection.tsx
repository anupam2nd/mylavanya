
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface PersonalInfoSectionProps {
  application: ArtistApplication;
}

export const PersonalInfoSection = ({ application }: PersonalInfoSectionProps) => {
  return (
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
  );
};
