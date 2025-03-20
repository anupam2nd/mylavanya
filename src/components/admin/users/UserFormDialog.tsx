
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: number;
  Username: string | null;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active: boolean;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserData: User | null;
  isNewUser: boolean;
  onUserSaved: (user: User) => void;
}

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" }
];

const UserFormDialog = ({ 
  open, 
  onOpenChange, 
  currentUserData, 
  isNewUser,
  onUserSaved 
}: UserFormDialogProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Initialize form values when currentUserData changes
  useEffect(() => {
    if (currentUserData) {
      setUsername(currentUserData.Username || "");
      setFirstName(currentUserData.FirstName || "");
      setLastName(currentUserData.LastName || "");
      setRole(currentUserData.role || "user");
      setIsActive(currentUserData.active);
      setPassword(""); // Don't populate password for existing users
    } else if (isNewUser) {
      // Reset form for new user
      setUsername("");
      setFirstName("");
      setLastName("");
      setRole("user");
      setPassword("");
      setIsActive(true);
    }
  }, [currentUserData, isNewUser]);

  const handleSave = async () => {
    try {
      if (!username) {
        throw new Error("Username is required");
      }

      if (isNewUser && !password) {
        throw new Error("Password is required for new users");
      }

      // Create base user data without password
      const userData: any = {
        Username: username,
        FirstName: firstName || null,
        LastName: lastName || null,
        role: role || "user",
        active: isActive
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
          onUserSaved(data[0]);
        }
        
        toast({
          title: "User added",
          description: "New user has been successfully added",
        });
      } else if (currentUserData) {
        // Update existing user
        const { error } = await supabase
          .from('UserMST')
          .update(userData)
          .eq('id', currentUserData.id);

        if (error) throw error;

        // Update our local state
        const updatedUser = { 
          ...currentUserData, 
          ...userData
        };
        
        onUserSaved(updatedUser);
        
        toast({
          title: "User updated",
          description: "User has been successfully updated",
        });
      }

      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(value) => setIsActive(value === "active")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
  );
};

export default UserFormDialog;
