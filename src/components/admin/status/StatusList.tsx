
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Power } from "lucide-react";
import { StatusOption } from "@/hooks/useStatusOptions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_code: "",
      status_name: "",
      description: "",
    },
  });

  const handleEdit = (status: StatusOption) => {
    setEditStatus(status);
    form.reset({
      status_code: status.status_code,
      status_name: status.status_name,
      description: status.description || "",
    });
  };

  const handleDelete = (status: StatusOption) => {
    setStatusToDelete(status);
    setIsDeleteDialogOpen(true);
  };

  const handleDeactivate = (status: StatusOption) => {
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
      const { error } = await supabase
        .from('statusmst')
        .update({ active: false })
        .eq('status_code', statusToDeactivate.status_code);

      if (error) throw error;

      toast({
        title: "Status deactivated",
        description: `Status "${statusToDeactivate.status_name}" has been deactivated`,
      });
      
      setIsDeactivateDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error deactivating status:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate the status",
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
      form.reset();
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

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status Code</TableHead>
              <TableHead>Status Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow key={status.status_code}>
                <TableCell className="font-medium">{status.status_code}</TableCell>
                <TableCell>{status.status_name}</TableCell>
                <TableCell>{status.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(status)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => handleDeactivate(status)}>
                      <Power className="h-4 w-4" />
                    </Button>
                    
                    {isSuperAdmin && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(status)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={!!editStatus} onOpenChange={(open) => !open && setEditStatus(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="status_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditStatus(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Only for Superadmin */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the status "{statusToDelete?.status_name}"? 
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deactivate</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to deactivate the status "{statusToDeactivate?.status_name}"?
          </p>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeactivateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDeactivate}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StatusList;
