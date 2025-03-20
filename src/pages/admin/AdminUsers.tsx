
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UsersTable from "@/components/admin/users/UsersTable";
import UserFormDialog from "@/components/admin/users/UserFormDialog";
import DeleteUserDialog from "@/components/admin/users/DeleteUserDialog";
import { User } from "@/components/admin/users/types";

const AdminUsers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('UserMST')
          .select('*')
          .order('Username', { ascending: true });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load users",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleAddNew = () => {
    setIsNewUser(true);
    setCurrentUserData(null);
    setOpenDialog(true);
  };

  const handleEdit = (user: User) => {
    setIsNewUser(false);
    setCurrentUserData(user);
    setOpenDialog(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from('UserMST')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userToDelete.id));
      toast({
        title: "User deleted",
        description: "The user has been successfully removed",
      });
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the user",
        variant: "destructive"
      });
    }
  };

  const handleUserSaved = (updatedUser: User) => {
    if (isNewUser) {
      setUsers([...users, updatedUser]);
    } else {
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    }
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="User Management">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-4">Loading users...</div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground">
                No users available. Add a new user to get started.
              </p>
            ) : (
              <UsersTable 
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUsersChange={setUsers}
                isSuperAdmin={isSuperAdmin}
              />
            )}
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <UserFormDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          currentUserData={currentUserData}
          isNewUser={isNewUser}
          onUserSaved={handleUserSaved}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteUserDialog
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={confirmDelete}
          user={userToDelete}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminUsers;
