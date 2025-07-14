
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";

interface User {
  id: string | null;
  email_id: string;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active?: boolean;
  PhoneNo?: number | null;
}

interface UserTableProps {
  users: User[];
  isSuperAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export const UserTable = ({ users, isSuperAdmin, onEdit, onDelete, onToggleStatus }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center">
        No users match your filters. Try adjusting your search criteria.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.email_id}>
              <TableCell className="font-medium">{user.email_id}</TableCell>
              <TableCell>{user.FirstName}</TableCell>
              <TableCell>{user.LastName}</TableCell>
              <TableCell>
                <span className={`px-3 py-1 text-xs font-medium rounded-full 
                  ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 
                    user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {user.role || 'user'}
                </span>
              </TableCell>
              <TableCell>{user.PhoneNo}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={user.active} 
                    onCheckedChange={() => onToggleStatus(user)}
                  />
                  <span className={user.active ? "text-green-600" : "text-red-600"}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                {isSuperAdmin && (
                  <Button variant="destructive" size="sm" onClick={() => onDelete(user)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
