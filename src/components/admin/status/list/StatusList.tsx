
import { useState } from "react";
import { StatusOption } from "@/hooks/useStatusOptions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StatusTable from "./StatusTable";
import EditStatusDialog from "./EditStatusDialog";
import DeleteStatusDialog from "./DeleteStatusDialog";
import StatusActivationDialog from "./StatusActivationDialog";
import { z } from "zod";

const formSchema = z.object({
  status_code: z.string().min(1, "Status code is required"),
  status_name: z.string().min(1, "Status name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StatusListProps {
  statuses: StatusOption[];
  onUpdate: () => void;
  isSuperAdmin?: boolean;
}

const StatusList = ({ statuses, onUpdate, isSuperAdmin = false }: StatusListProps) => {
  const { toast } = useToast();
  const [editStatus, setEditStatus] = useState<StatusOption | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<StatusOption | null>(null);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [statusToDeactivate, setStatusToDeactivate] = useState<StatusOption | null>(null);

  const handleEdit = (status: StatusOption) => {
    setEditStatus(status);
  };

  const handleDelete = (status: StatusOption) => {
    setStatusToDelete(status);
    setIsDeleteDialogOpen(true);
  };

  const toggleStatus = (status: StatusOption) => {
    setStatusToDeactivate(status);
    setIsDeactivateDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!statusToDelete) return;

    try {
      const { error } = await supabase
        .from('statusmst')
        .delete()
        .eq('status_code', statusToDelete.status_code);

      if (error) throw error;

      toast({
        title: "Status deleted",
        description: `Status "${statusToDelete.status_name}" has been removed`,
      });
      
      setIsDeleteDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error deleting status:', error);
      toast({
        title: "Error",
        description: "Failed to delete the status",
        variant: "destructive",
      });
    }
  };

  const confirmDeactivate = async () => {
    if (!statusToDeactivate) return;

    try {
      const newActiveState = !statusToDeactivate.active;
      const { error } = await supabase
        .from('statusmst')
        .update({ active: newActiveState })
        .eq('status_code', statusToDeactivate.status_code);

      if (error) throw error;

      toast({
        title: newActiveState ? "Status activated" : "Status deactivated",
        description: `Status "${statusToDeactivate.status_name}" has been ${newActiveState ? "activated" : "deactivated"}`,
      });
      
      setIsDeactivateDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating status active state:', error);
      toast({
        title: "Error",
        description: "Failed to update the status",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editStatus) {
        const { error } = await supabase
          .from('statusmst')
          .update({
            status_name: values.status_name,
            description: values.description,
          })
          .eq('status_code', editStatus.status_code);

        if (error) throw error;

        toast({
          title: "Status updated",
          description: "The status has been updated successfully",
        });
      }

      setEditStatus(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving status:', error);
      toast({
        title: "Error",
        description: "Failed to save the status",
        variant: "destructive",
      });
    }
  };

  const handleCloseEditDialog = () => setEditStatus(null);
  const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);
  const handleCloseDeactivateDialog = () => setIsDeactivateDialogOpen(false);

  return (
    <div>
      <StatusTable 
        statuses={statuses}
        handleEdit={handleEdit}
        toggleStatus={toggleStatus}
        handleDelete={handleDelete}
        isSuperAdmin={isSuperAdmin}
      />

      <EditStatusDialog 
        status={editStatus}
        onClose={handleCloseEditDialog}
        onSubmit={onSubmit}
      />

      <DeleteStatusDialog
        status={statusToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
      />

      <StatusActivationDialog
        status={statusToDeactivate}
        isOpen={isDeactivateDialogOpen}
        onClose={handleCloseDeactivateDialog}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
};

export default StatusList;
