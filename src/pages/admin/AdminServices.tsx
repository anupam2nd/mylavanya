
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, X, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface Service {
  prod_id: number;
  ProductName: string | null;
  Category: string | null;
  Price: number | null;
  Description: string | null;
  active: boolean | null;
}

const AdminServices = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    ProductName: "",
    Category: "",
    Price: "",
    Description: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('PriceMST')
        .select('*')
        .order('ProductName', { ascending: true });

      if (error) throw error;
      setServices(data || []);
      setFilteredServices(data || []);
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

  useEffect(() => {
    let result = [...services];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        service => 
          (service.ProductName && service.ProductName.toLowerCase().includes(query)) ||
          (service.Category && service.Category.toLowerCase().includes(query)) ||
          (service.Description && service.Description.toLowerCase().includes(query))
      );
    }
    
    setFilteredServices(result);
  }, [services, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newService = {
        ...formData,
        Price: parseFloat(formData.Price),
        active: true
      };

      if (selectedService) {
        // Update existing service
        const { error } = await supabase
          .from('PriceMST')
          .update(newService)
          .eq('prod_id', selectedService.prod_id);

        if (error) throw error;
        toast({ title: "Service updated successfully" });
      } else {
        // Create new service
        const { error } = await supabase
          .from('PriceMST')
          .insert([newService]);

        if (error) throw error;
        toast({ title: "Service created successfully" });
      }

      setIsEditDialogOpen(false);
      setSelectedService(null);
      setFormData({ ProductName: "", Category: "", Price: "", Description: "" });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error saving service",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      ProductName: service.ProductName || "",
      Category: service.Category || "",
      Price: service.Price?.toString() || "",
      Description: service.Description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (serviceId: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from('PriceMST')
        .delete()
        .eq('prod_id', serviceId);

      if (error) throw error;
      toast({ title: "Service deleted successfully" });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error deleting service",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Service Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Services List</CardTitle>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setSelectedService(null);
                  setFormData({ ProductName: "", Category: "", Price: "", Description: "" });
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedService ? "Edit Service" : "Add New Service"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Service Name"
                    name="ProductName"
                    value={formData.ProductName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    placeholder="Category"
                    name="Category"
                    value={formData.Category}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    placeholder="Price"
                    name="Price"
                    type="number"
                    value={formData.Price}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    placeholder="Description"
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                  />
                  <Button type="submit" className="w-full">
                    {selectedService ? "Update Service" : "Create Service"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredServices.length} of {services.length} services
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading services...</div>
            ) : filteredServices.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No services match your search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <TableRow key={service.prod_id}>
                        <TableCell className="font-medium">{service.ProductName}</TableCell>
                        <TableCell>{service.Category}</TableCell>
                        <TableCell>₹{service.Price}</TableCell>
                        <TableCell>{service.Description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(service.prod_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminServices;
