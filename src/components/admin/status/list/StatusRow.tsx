
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { StatusOption } from "@/hooks/useStatusOptions";

interface StatusRowProps {
  status: StatusOption;
  handleEdit: (status: StatusOption) => void;
  toggleStatus: (status: StatusOption) => void;
  handleDelete: (status: StatusOption) => void;
  isSuperAdmin?: boolean;
}

const StatusRow = ({ 
  status, 
  handleEdit, 
  toggleStatus, 
  handleDelete, 
  isSuperAdmin = false 
}: StatusRowProps) => {
  return (
    <TableRow key={status.status_code}>
      <TableCell className="font-medium">{status.status_code}</TableCell>
      <TableCell>{status.status_name}</TableCell>
      <TableCell>{status.description || "-"}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={status.active} 
            onCheckedChange={() => toggleStatus(status)}
          />
          <span className={status.active ? "text-green-600" : "text-red-600"}>
            {status.active ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(status)}>
            <Edit className="h-4 w-4" />
          </Button>
          
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={() => handleDelete(status)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default StatusRow;
