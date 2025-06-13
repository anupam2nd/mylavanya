
import { Service } from "./ServiceForm";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Image } from "lucide-react";

interface ServiceTableRowProps {
  service: Service;
  isSuperAdmin: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onRowClick: (service: Service) => void;
}

const ServiceTableRow = ({
  service,
  isSuperAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
  onRowClick,
}: ServiceTableRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(service)}
    >
      <TableCell className="font-medium text-primary">
        #{service.prod_id}
      </TableCell>
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
      <TableCell>{service.Category}</TableCell>
      <TableCell>{service.SubCategory}</TableCell>
      <TableCell>₹{service.Price}</TableCell>
      <TableCell>{service.Discount}%</TableCell>
      <TableCell>₹{service.NetPayable}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={service.active} 
            onCheckedChange={(checked) => {
              onToggleStatus(service);
            }}
            onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => {
            e.stopPropagation();
            onEdit(service);
          }}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        
        {isSuperAdmin && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(service);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ServiceTableRow;
