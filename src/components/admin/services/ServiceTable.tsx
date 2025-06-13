
import { Service } from "./ServiceForm";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import ServiceTableRow from "./ServiceTableRow";

interface ServiceTableProps {
  filteredServices: Service[];
  isSuperAdmin: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onRowClick: (service: Service) => void;
}

const ServiceTable = ({
  filteredServices,
  isSuperAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
  onRowClick,
}: ServiceTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Sub-service</TableHead>
            <TableHead>Scheme</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discount %</TableHead>
            <TableHead>Net Payable</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredServices.map((service) => (
            <ServiceTableRow
              key={service.prod_id}
              service={service}
              isSuperAdmin={isSuperAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onRowClick={onRowClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ServiceTable;
