
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface ApplicationInfoSectionProps {
  application: ArtistApplication;
}

export const ApplicationInfoSection = ({ application }: ApplicationInfoSectionProps) => {
  return (
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
  );
};
