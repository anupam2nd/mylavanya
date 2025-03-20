
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, XCircle } from "lucide-react";

interface User {
  id: number;
  Username: string | null;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active: boolean;
}

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onUsersChange: (users: User[]) => void;
  isSuperAdmin: boolean;
}

const UsersTable = ({ 
  users, 
  onEdit, 
  onDelete, 
  onUsersChange,
  isSuperAdmin 
}: UsersTableProps) => {
  const { toast } = useToast();

  const handleDeactivate = async (user: User) => {
    try {
      const { error } = await supabase
        .from('UserMST')
        .update({ active: false })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, active: false } : u
      );
      
      onUsersChange(updatedUsers);
      
      toast({
        title: "User deactivated",
        description: "The user has been successfully deactivated",
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Deactivation failed",
        description: "There was a problem deactivating the user",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={!user.active ? "opacity-60" : ""}>
              <TableCell className="font-medium">{user.Username}</TableCell>
              <TableCell>{user.FirstName}</TableCell>
              <TableCell>{user.LastName}</TableCell>
              <TableCell>
                <span className={`px-3 py-1 text-xs font-medium rounded-full 
                  ${user.role?.includes('superadmin') ? 'bg-purple-100 text-purple-800' : 
                    user.role?.includes('admin') ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {user.role || 'user'}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-3 py-1 text-xs font-medium rounded-full 
                  ${!user.active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                {isSuperAdmin ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeactivate(user)}
                    disabled={!user.active}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Deactivate
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

export default UsersTable;
