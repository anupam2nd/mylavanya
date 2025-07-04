
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface AddressSectionProps {
  application: ArtistApplication;
}

export const AddressSection = ({ application }: AddressSectionProps) => {
  return (
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
  );
};
