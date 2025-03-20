
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface StatusItem {
  id: number;
  status_code: string;
  status_name: string;
  description: string | null;
}

const AdminStatus = () => {
  const { toast } = useToast();
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isNewStatus, setIsNewStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<StatusItem | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<StatusItem | null>(null);
  
  // Form state
  const [statusCode, setStatusCode] = useState("");
  const [statusName, setStatusName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch status items
  useEffect(() => {
    const fetchStatusItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('statusmst')
          .select('*')
          .order('status_code', { ascending: true });

        if (error) throw error;
        setStatusItems(data || []);
      } catch (error) {
        console.error('Error fetching status items:', error);
        toast({
          title: "Failed to load status items",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatusItems();
  }, [toast]);

  const handleAddNew = () => {
    setIsNewStatus(true);
    setCurrentStatus(null);
    setStatusCode("");
    setStatusName("");
    setDescription("");
    setOpenDialog(true);
  };

  const handleEdit = (status: StatusItem) => {
    setIsNewStatus(false);
    setCurrentStatus(status);
    setStatusCode(status.status_code);
    setStatusName(status.status_name);
    setDescription(status.description || "");
    setOpenDialog(true);
  };

  const handleDelete = (status: StatusItem) => {
    setStatusToDelete(status);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!statusToDelete) return;

    try {
      const { error } = await supabase
        .from('statusmst')
        .delete()
        .eq('id', statusToDelete.id);

      if (error) throw error;

      setStatusItems(statusItems.filter(item => item.id !== statusToDelete.id));
      toast({
        title: "Status deleted",
        description: "The status has been successfully removed",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting status:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the status",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!statusCode || !statusName) {
        throw new Error("Status code and name are required");
      }

      const statusData = {
        status_code: statusCode,
        status_name: statusName,
        description: description || null
      };

      if (isNewStatus) {
        // Add new status
        const { data, error } = await supabase
          .from('statusmst')
          .insert([statusData])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setStatusItems([...statusItems, data[0]]);
        }
        
        toast({
          title: "Status added",
          description: "New status has been successfully added",
        });
      } else if (currentStatus) {
        // Update existing status
        const { error } = await supabase
          .from('statusmst')
          .update(statusData)
          .eq('id', currentStatus.id);

        if (error) throw error;

        setStatusItems(statusItems.map(item => 
          item.id === currentStatus.id 
            ? { ...item, ...statusData } 
            : item
        ));
        
        toast({
          title: "Status updated",
          description: "Status has been successfully updated",
        });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving status:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the status",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="Status Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Status Management</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add New Status
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">Loading status items...</div>
            ) : statusItems.length === 0 ? (
              <p className="text-muted-foreground">
                No status items available. Add a new status to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status Code</TableHead>
                      <TableHead>Status Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.status_code}</TableCell>
                        <TableCell>{item.status_name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Form Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isNewStatus ? "Add New Status" : "Edit Status"}</DialogTitle>
              <DialogDescription>
                {isNewStatus 
                  ? "Add a new status to the system." 
                  : "Make changes to the existing status."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-code" className="text-right">
                  Status Code
                </Label>
                <Input
                  id="status-code"
                  value={statusCode}
                  onChange={(e) => setStatusCode(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-name" className="text-right">
                  Status Name
                </Label>
                <Input
                  id="status-name"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3 min-h-20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                status and may affect bookings using this status.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminStatus;
