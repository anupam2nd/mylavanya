
import { Database } from "@/integrations/supabase/types";

type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface TrainingSectionProps {
  application: ArtistApplication;
}

export const TrainingSection = ({ application }: TrainingSectionProps) => {
  return (
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
  );
};
