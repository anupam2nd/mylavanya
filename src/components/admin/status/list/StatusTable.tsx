
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { StatusOption } from "@/hooks/useStatusOptions";
import StatusRow from "./StatusRow";

interface StatusTableProps {
  statuses: StatusOption[];
  handleEdit: (status: StatusOption) => void;
  toggleStatus: (status: StatusOption) => void;
  handleDelete: (status: StatusOption) => void;
  isSuperAdmin?: boolean;
}

const StatusTable = ({ 
  statuses, 
  handleEdit, 
  toggleStatus, 
  handleDelete, 
  isSuperAdmin = false 
}: StatusTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status Code</TableHead>
            <TableHead>Status Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statuses.map((status) => (
            <StatusRow 
              key={status.status_code}
              status={status}
              handleEdit={handleEdit}
              toggleStatus={toggleStatus}
              handleDelete={handleDelete}
              isSuperAdmin={isSuperAdmin}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StatusTable;
