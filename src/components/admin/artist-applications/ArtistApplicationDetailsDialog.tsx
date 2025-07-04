
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Database } from "@/integrations/supabase/types";
import { StatusSection } from "./sections/StatusSection";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { AddressSection } from "./sections/AddressSection";
import { GuardianSection } from "./sections/GuardianSection";
import { JobInfoSection } from "./sections/JobInfoSection";
import { TrainingSection } from "./sections/TrainingSection";
import { ApplicationInfoSection } from "./sections/ApplicationInfoSection";
import { CourseKnowledgeRenderer } from "./utils/courseKnowledgeRenderer";

// Use the exact type from Supabase database schema
type ArtistApplication = Database['public']['Tables']['ArtistApplication']['Row'];

interface ArtistApplicationDetailsDialogProps {
  application: ArtistApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (applicationId: string, newStatus: string) => void;
}

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
          <StatusSection
            application={application}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onStatusUpdate={handleStatusUpdate}
          />

          <Separator />
          <PersonalInfoSection application={application} />

          <Separator />
          <AddressSection application={application} />

          <Separator />
          <GuardianSection application={application} />

          <Separator />
          <JobInfoSection application={application} />

          <Separator />
          <TrainingSection application={application} />

          <Separator />
          <ApplicationInfoSection application={application} />

          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3">Course Knowledge</h3>
            <CourseKnowledgeRenderer courseKnowledge={application.course_knowledge} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtistApplicationDetailsDialog;
