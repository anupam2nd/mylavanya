
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface JobInfoSectionProps {
  application: ArtistApplication;
}

export const JobInfoSection = ({ application }: JobInfoSectionProps) => {
  return (
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
  );
};
