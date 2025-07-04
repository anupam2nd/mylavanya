
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface GuardianSectionProps {
  application: ArtistApplication;
}

export const GuardianSection = ({ application }: GuardianSectionProps) => {
  return (
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
  );
};
