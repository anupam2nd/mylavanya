
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Import the refactored components
import ServiceForm, { Service } from "@/components/admin/services/ServiceForm";
import ServiceList from "@/components/admin/services/ServiceList";
import { 
  DeleteServiceDialog,
  StatusChangeDialog
} from "@/components/admin/services/ServiceDialogs";
import { filterServices, getNextProdId } from "@/utils/services/serviceUtils";

const AdminServices = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setIsLoading] = useState(true);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [isNewService, setIsNewService] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [serviceToDeactivate, setServiceToDeactivate] = useState<Service | null>(null);
  
  // Search, filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<string[]>([]);
  
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [sortOrder]);

  useEffect(() => {
    const result = filterServices(services, searchQuery, activeFilter, categoryFilter);
    setFilteredServices(result);
  }, [services, searchQuery, activeFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('PriceMST')
        .select('Category')
        .not('Category', 'is', null);

      if (error) throw error;
      
      const uniqueCategories = [...new Set(data.map(item => item.Category))].filter(Boolean);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('PriceMST')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' });

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
      setIsLoading(false);
    }
  };

  const handleSortChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
  };

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilter(category);
  };

  const handleAddNew = () => {
    setIsNewService(true);
    setCurrentService(null);
    setOpenDialog(true);
  };

  const handleEdit = (service: Service) => {
    setIsNewService(false);
    setCurrentService(service);
    setOpenDialog(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setOpenDeleteDialog(true);
  };

  const handleToggleStatus = (service: Service) => {
    setServiceToDeactivate(service);
    setOpenDeactivateDialog(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      // Delete the image from storage if it exists
      if (serviceToDelete.imageUrl) {
        const imagePath = serviceToDelete.imageUrl.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('service-images')
            .remove([imagePath]);
        }
      }

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

  const confirmStatusChange = async () => {
    if (!serviceToDeactivate) return;

    try {
      const newActiveState = !serviceToDeactivate.active;
      const { error } = await supabase
        .from('PriceMST')
        .update({ active: newActiveState })
        .eq('prod_id', serviceToDeactivate.prod_id);

      if (error) throw error;

      setServices(services.map(service => 
        service.prod_id === serviceToDeactivate.prod_id 
          ? { ...service, active: newActiveState } 
          : service
      ));
      
      toast({
        title: newActiveState ? "Service activated" : "Service deactivated",
        description: `Service "${serviceToDeactivate.Services}" has been ${newActiveState ? "activated" : "deactivated"}`,
      });
      
      setOpenDeactivateDialog(false);
    } catch (error) {
      console.error('Error updating service active state:', error);
      toast({
        title: "Error",
        description: "Failed to update the service",
        variant: "destructive",
      });
    }
  };

  const handleSaveService = async (serviceData: Service) => {
    try {
      // Check authentication
      if (!user || !user.id) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save services. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      if (isNewService) {
        // Get next available prod_id before inserting
        const nextProdId = await getNextProdId();
        
        // Add the prod_id to the service data
        const serviceDataWithId = {
          ...serviceData,
          prod_id: nextProdId
        };
        
        const { data, error } = await supabase
          .from('PriceMST')
          .insert([serviceDataWithId])
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
          <CardContent className="pt-6">
            <ServiceList 
              services={services}
              filteredServices={filteredServices}
              loading={loading}
              isSuperAdmin={isSuperAdmin}
              categories={categories}
              sortOrder={sortOrder}
              categoryFilter={categoryFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onAddNew={handleAddNew}
              onSortChange={handleSortChange}
              onCategoryFilterChange={handleCategoryFilterChange}
            />
          </CardContent>
        </Card>

        <ServiceForm 
          open={openDialog}
          onOpenChange={setOpenDialog}
          currentService={currentService}
          isNewService={isNewService}
          onSave={handleSaveService}
          services={services}
        />

        <DeleteServiceDialog 
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          service={serviceToDelete}
          onConfirm={confirmDelete}
        />

        <StatusChangeDialog 
          open={openDeactivateDialog}
          onOpenChange={setOpenDeactivateDialog}
          service={serviceToDeactivate}
          onConfirm={confirmStatusChange}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminServices;
