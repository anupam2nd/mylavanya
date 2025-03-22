
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Trash2, Power, Search, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: number;
  Username: string | null;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active?: boolean;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  
  // New filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const isSuperAdmin = user?.role === 'superadmin';
  
  // Form state
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  
  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
    { value: "superadmin", label: "Super Admin" }
  ];

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
        setFilteredUsers(data || []);
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

  // Filter users based on search query and filters
  useEffect(() => {
    let result = [...users];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          (user.Username && user.Username.toLowerCase().includes(query)) ||
          (user.FirstName && user.FirstName.toLowerCase().includes(query)) ||
          (user.LastName && user.LastName.toLowerCase().includes(query))
      );
    }
    
    // Filter by role
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Filter by active status
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter(user => user.active === isActive);
    }
    
    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter, activeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setActiveFilter("all");
  };

  const handleAddNew = () => {
    setIsNewUser(true);
    setCurrentUser(null);
    setUsername("");
    setFirstName("");
    setLastName("");
    setRole("user");
    setPassword("");
    setOpenDialog(true);
  };

  const handleEdit = (user: User) => {
    setIsNewUser(false);
    setCurrentUser(user);
    setUsername(user.Username || "");
    setFirstName(user.FirstName || "");
    setLastName(user.LastName || "");
    setRole(user.role || "user");
    setPassword(""); // Don't populate password for existing users
    setOpenDialog(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeactivate = (user: User) => {
    setUserToDeactivate(user);
    setOpenDeactivateDialog(true);
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

  const confirmDeactivate = async () => {
    if (!userToDeactivate) return;

    try {
      const { error } = await supabase
        .from('UserMST')
        .update({ active: false })
        .eq('id', userToDeactivate.id);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userToDeactivate.id 
          ? { ...user, active: false } 
          : user
      ));
      
      toast({
        title: "User deactivated",
        description: `User "${userToDeactivate.Username}" has been deactivated`,
      });
      
      setOpenDeactivateDialog(false);
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate the user",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!username) {
        throw new Error("Username is required");
      }

      if (isNewUser && !password) {
        throw new Error("Password is required for new users");
      }

      const userData: any = {
        Username: username,
        FirstName: firstName || null,
        LastName: lastName || null,
        role: role || "user",
        active: true
      };

      // Only include password for new users or if it was changed
      if (password) {
        userData.password = password;
      }

      if (isNewUser) {
        // Add new user
        const { data, error } = await supabase
          .from('UserMST')
          .insert([userData])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setUsers([...users, data[0]]);
        }
        
        toast({
          title: "User added",
          description: "New user has been successfully added",
        });
      } else if (currentUser) {
        // Update existing user
        const { error } = await supabase
          .from('UserMST')
          .update(userData)
          .eq('id', currentUser.id);

        if (error) throw error;

        setUsers(users.map(user => 
          user.id === currentUser.id 
            ? { ...user, ...userData } 
            : user
        ));
        
        toast({
          title: "User updated",
          description: "User has been successfully updated",
        });
      }

      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the user",
        variant: "destructive"
      });
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
            {/* Filter Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="superadmin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={activeFilter}
                onValueChange={setActiveFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
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

            {loading ? (
              <div className="flex justify-center p-4">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No users match your filters. Try adjusting your search criteria.
              </p>
            ) : (
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.Username}</TableCell>
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
                        <TableCell>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          
                          {user.active && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeactivate(user)}
                            >
                              <Power className="h-4 w-4 mr-1" /> Deactivate
                            </Button>
                          )}
                          
                          {isSuperAdmin && (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(user)}
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
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isNewUser ? "Add New User" : "Edit User"}</DialogTitle>
              <DialogDescription>
                {isNewUser 
                  ? "Add a new user to the system." 
                  : "Make changes to the existing user."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first-name" className="text-right">
                  First Name
                </Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last-name" className="text-right">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={role}
                  onValueChange={setRole}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {isNewUser ? "Password" : "New Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  placeholder={isNewUser ? "Required" : "Leave blank to keep current"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSave}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog - Only for Superadmins */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                user and all related data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Deactivate Confirmation Dialog */}
        <AlertDialog open={openDeactivateDialog} onOpenChange={setOpenDeactivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deactivation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate this user? Their account will be disabled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeactivate}>
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminUsers;
