
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash2 } from "lucide-react";
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

interface Service {
  prod_id: number;
  Services: string;
  ProductName: string | null;
  Description: string | null;
  Price: number;
}

const AdminServices = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isNewService, setIsNewService] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  
  // Form state
  const [serviceName, setServiceName] = useState("");
  const [productName, setProductName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('PriceMST')
          .select('*')
          .order('Services', { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Failed to load services",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  const handleAddNew = () => {
    setIsNewService(true);
    setCurrentService(null);
    setServiceName("");
    setProductName("");
    setServiceDescription("");
    setServicePrice("");
    setOpenDialog(true);
  };

  const handleEdit = (service: Service) => {
    setIsNewService(false);
    setCurrentService(service);
    setServiceName(service.Services);
    setProductName(service.ProductName || "");
    setServiceDescription(service.Description || "");
    setServicePrice(service.Price.toString());
    setOpenDialog(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      const { error } = await supabase
        .from('PriceMST')
        .delete()
        .eq('prod_id', serviceToDelete.prod_id);

      if (error) throw error;

      setServices(services.filter(s => s.prod_id !== serviceToDelete.prod_id));
      toast({
        title: "Service deleted",
        description: "The service has been successfully removed",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the service",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      const priceValue = parseInt(servicePrice);
      
      if (isNaN(priceValue)) {
        throw new Error("Price must be a valid number");
      }

      const serviceData = {
        Services: serviceName,
        ProductName: productName || null,
        Description: serviceDescription || null,
        Price: priceValue
      };

      if (isNewService) {
        // Add new service
        const { data, error } = await supabase
          .from('PriceMST')
          .insert([serviceData])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setServices([...services, data[0]]);
        }
        
        toast({
          title: "Service added",
          description: "New service has been successfully added",
        });
      } else if (currentService) {
        // Update existing service
        const { error } = await supabase
          .from('PriceMST')
          .update(serviceData)
          .eq('prod_id', currentService.prod_id);

        if (error) throw error;

        setServices(services.map(service => 
          service.prod_id === currentService.prod_id 
            ? { ...service, ...serviceData } 
            : service
        ));
        
        toast({
          title: "Service updated",
          description: "Service has been successfully updated",
        });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the service",
        variant: "destructive"
      });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Manage Services">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Service Management</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">Loading services...</div>
            ) : services.length === 0 ? (
              <p className="text-muted-foreground">
                No services available. Add a new service to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.prod_id}>
                        <TableCell className="font-medium">{service.Services}</TableCell>
                        <TableCell>{service.ProductName}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {service.Description}
                        </TableCell>
                        <TableCell>₹{service.Price}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(service)}
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

        {/* Service Form Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isNewService ? "Add New Service" : "Edit Service"}</DialogTitle>
              <DialogDescription>
                {isNewService 
                  ? "Add a new service to your catalog." 
                  : "Make changes to the existing service."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-name" className="text-right">
                  Service Name
                </Label>
                <Input
                  id="service-name"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product-name" className="text-right">
                  Product Name
                </Label>
                <Input
                  id="product-name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-price" className="text-right">
                  Price (₹)
                </Label>
                <Input
                  id="service-price"
                  type="number"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="service-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="service-description"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="col-span-3"
                  rows={3}
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
                service and all related data.
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

export default AdminServices;
