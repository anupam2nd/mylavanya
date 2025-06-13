
import { useState } from "react";
import { Service } from "./ServiceForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";
import ServiceDetailsModal from "./ServiceDetailsModal";
import ServiceFilters from "./ServiceFilters";
import ServiceTable from "./ServiceTable";

interface ServiceListProps {
  services: Service[];
  filteredServices: Service[];
  loading: boolean;
  isSuperAdmin: boolean;
  categories: string[];
  sortOrder: 'asc' | 'desc';
  categoryFilter: string;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onAddNew: () => void;
  onSortChange: (sortOrder: 'asc' | 'desc') => void;
  onCategoryFilterChange: (category: string) => void;
}

const ServiceList = ({
  services,
  filteredServices,
  loading,
  isSuperAdmin,
  categories,
  sortOrder,
  categoryFilter,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
  onSortChange,
  onCategoryFilterChange,
}: ServiceListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const serviceHeaders = {
    prod_id: 'ID',
    Services: 'Service Name',
    ProductName: 'Product Name',
    Subservice: 'Sub Service',
    Scheme: 'Scheme',
    Category: 'Category',
    SubCategory: 'Sub Category',
    Price: 'Price',
    Discount: 'Discount %',
    NetPayable: 'Net Payable',
    Description: 'Description',
    active: 'Status',
    imageUrl: 'Image'
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    onCategoryFilterChange("all");
  };

  const handleRowClick = (service: Service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mb-4">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">Service Management</h2>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <ExportButton
            data={filteredServices}
            filename="services"
            headers={serviceHeaders}
            buttonText="Export Services"
          />
          <Button onClick={onAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add New Service
          </Button>
        </div>
      </div>
      
      <ServiceFilters
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        categoryFilter={categoryFilter}
        categories={categories}
        sortOrder={sortOrder}
        onSearchChange={handleSearch}
        onActiveFilterChange={handleFilterChange}
        onCategoryFilterChange={onCategoryFilterChange}
        onSortChange={onSortChange}
        onClearFilters={clearFilters}
      />

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredServices.length} of {services.length} services 
        {sortOrder === 'desc' ? ' (Newest first)' : ' (Oldest first)'}
      </div>

      {loading ? (
        <div className="flex justify-center p-4">Loading services...</div>
      ) : filteredServices.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center">
          No services match your filters. Try adjusting your search criteria.
        </p>
      ) : (
        <ServiceTable
          filteredServices={filteredServices}
          isSuperAdmin={isSuperAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onRowClick={handleRowClick}
        />
      )}

      <ServiceDetailsModal
        service={selectedService}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </div>
  );
};

export default ServiceList;
