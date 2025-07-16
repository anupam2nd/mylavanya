
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ExportButton } from "@/components/ui/export-button";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserDialog } from "@/components/admin/users/UserDialog";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import { StatusToggleDialog } from "@/components/admin/users/StatusToggleDialog";
import { useUserManagement } from "@/hooks/useUserManagement";

// Use local interface that matches the database schema
interface LocalUser {
  id: string; // Changed to string to match UserMST.id (uuid)
  email_id: string | null;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active?: boolean;
  PhoneNo?: number | null;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const {
    filteredUsers,
    loading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    activeFilter,
    setActiveFilter,
    clearFilters,
    deleteUser,
    toggleUserStatus,
    saveUser
  } = useUserManagement();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<LocalUser | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<LocalUser | null>(null);
  
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNo, setPhoneNo] = useState("");

  const userHeaders = {
    id: 'ID',
    email_id: 'Email',
    FirstName: 'First Name',
    LastName: 'Last Name',
    role: 'Role',
    PhoneNo: 'Phone Number',
    active: 'Status'
  };

  const handleAddNew = () => {
    setIsNewUser(true);
    setCurrentUser(null);
    setEmail("");
    setFirstName("");
    setLastName("");
    setRole("admin");
    setPhoneNo("");
    setOpenDialog(true);
  };

  const handleEdit = (user: LocalUser) => {
    setIsNewUser(false);
    setCurrentUser(user);
    setEmail(user.email_id || "");
    setFirstName(user.FirstName || "");
    setLastName(user.LastName || "");
    setRole(user.role || "admin");
    setPhoneNo(user.PhoneNo ? user.PhoneNo.toString() : "");
    setOpenDialog(true);
  };

  const handleDelete = (user: LocalUser) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeactivate = (user: LocalUser) => {
    setUserToDeactivate(user);
    setOpenDeactivateDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete.id);
    setOpenDeleteDialog(false);
  };

  const confirmDeactivate = async () => {
    if (!userToDeactivate) return;
    await toggleUserStatus(userToDeactivate.id, userToDeactivate.active || false);
    setOpenDeactivateDialog(false);
  };

  const handleSave = async () => {
    try {
      const userData = {
        email_id: email,
        FirstName: firstName,
        LastName: lastName,
        role: role,
        PhoneNo: phoneNo
      };

      await saveUser(userData, isNewUser, currentUser?.id);
      setOpenDialog(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="User Management">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle>User Management</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <ExportButton
                data={filteredUsers}
                filename="users"
                headers={userHeaders}
                buttonText="Export Users"
              />
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <UserFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onClearFilters={clearFilters}
            />

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredUsers.length} users
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading users...</div>
            ) : (
              <UserTable
                users={filteredUsers}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleDeactivate}
              />
            )}
          </CardContent>
        </Card>

        <UserDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          isNewUser={isNewUser}
          email={email}
          setEmail={setEmail}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          role={role}
          setRole={setRole}
          phoneNo={phoneNo}
          setPhoneNo={setPhoneNo}
          onSave={handleSave}
        />

        <DeleteUserDialog
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={confirmDelete}
        />

        <StatusToggleDialog
          open={openDeactivateDialog}
          onOpenChange={setOpenDeactivateDialog}
          user={userToDeactivate}
          onConfirm={confirmDeactivate}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminUsers;
