
import { useState } from "react";
import { Service } from "./ServiceForm";
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
import { Edit, Trash2, Search, X, Image } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExportButton } from "@/components/ui/export-button";

interface ServiceListProps {
  services: Service[];
  filteredServices: Service[];
  loading: boolean;
  isSuperAdmin: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onAddNew: () => void;
}

const ServiceList = ({
  services,
  filteredServices,
  loading,
  isSuperAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
}: ServiceListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const serviceHeaders = {
    prod_id: 'ID',
    Services: 'Service Name',
    ProductName: 'Product Name',
    Subservice: 'Sub Service',
    Scheme: 'Scheme',
    Category: 'Category',
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
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={activeFilter}
          onValueChange={handleFilterChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="active">Active Services</SelectItem>
            <SelectItem value="inactive">Inactive Services</SelectItem>
          </SelectContent>
        </Select>
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
          No services match your filters. Try adjusting your search criteria.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Sub-service</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Discount %</TableHead>
                <TableHead>Net Payable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.prod_id}>
                  <TableCell>
                    {service.imageUrl ? (
                      <div className="w-10 h-10 relative rounded overflow-hidden">
                        <img 
                          src={service.imageUrl} 
                          alt={service.Services} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
                        <Image className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{service.Services}</TableCell>
                  <TableCell className="max-w-xs truncate">{service.ProductName}</TableCell>
                  <TableCell>{service.Subservice}</TableCell>
                  <TableCell>{service.Scheme}</TableCell>
                  <TableCell>₹{service.Price}</TableCell>
                  <TableCell>{service.Discount}%</TableCell>
                  <TableCell>₹{service.NetPayable}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={service.active} 
                        onCheckedChange={() => onToggleStatus(service)}
                      />
                      <span className={service.active ? "text-green-600" : "text-red-600"}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(service)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    
                    {isSuperAdmin && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onDelete(service)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Fix missing Plus icon import
import { Plus } from "lucide-react";

export default ServiceList;
