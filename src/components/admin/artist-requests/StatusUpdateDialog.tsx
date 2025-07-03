
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useCustomToast } from "@/context/ToastContext";
import { Loader2 } from "lucide-react";

interface ArtistApplication {
  id: string;
  full_name: string;
  status: string;
}

interface StatusUpdateDialogProps {
  application: ArtistApplication;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'selected', label: 'Selected' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'on_hold', label: 'On Hold' },
];

export default function StatusUpdateDialog({
  application,
  isOpen,
  onClose,
  onUpdate,
}: StatusUpdateDialogProps) {
  const [status, setStatus] = useState(application.status || 'pending');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Updating application:', application.id, 'with status:', status);
      
      const { error } = await supabase
        .from('ArtistApplication')
        .update({
          status: status,
          trainer_feedback: feedback || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.id);

      if (error) {
        console.error('Error updating status:', error);
        showToast("❌ Failed to update status. Please try again.", 'error', 4000);
        return;
      }

      showToast("✅ Status updated successfully!", 'success', 4000);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast("❌ An unexpected error occurred. Please try again.", 'error', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Applicant: {application.full_name}
            </Label>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Add feedback or comments..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
