
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email_id: string | null;
  FirstName: string | null;
  LastName: string | null;
  role: string | null;
  active?: boolean;
  PhoneNo?: number | null;
}

export const useUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('UserMST')
        .select('*')
        .order('email_id', { ascending: true });

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        user => 
          (user.email_id && user.email_id.toLowerCase().includes(query)) ||
          (user.FirstName && user.FirstName.toLowerCase().includes(query)) ||
          (user.LastName && user.LastName.toLowerCase().includes(query))
      );
    }
    
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }
    
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

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('UserMST')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      toast({
        title: "User deleted",
        description: "The user has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Deletion failed",
        description: "There was a problem deleting the user",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newActiveState = !currentStatus;
      const { error } = await supabase
        .from('UserMST')
        .update({ active: newActiveState })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, active: newActiveState } 
          : user
      ));
      
      const targetUser = users.find(u => u.id === userId);
      toast({
        title: newActiveState ? "User activated" : "User deactivated",
        description: `User "${targetUser?.email_id}" has been ${newActiveState ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error('Error updating user active state:', error);
      toast({
        title: "Error",
        description: "Failed to update the user",
        variant: "destructive",
      });
    }
  };

  const saveUser = async (userData: any, isNewUser: boolean, currentUserId?: string) => {
    try {
      if (!userData.email_id) {
        throw new Error("Email is required");
      }

      if (!userData.PhoneNo) {
        throw new Error("Phone number is required");
      }

      const userPayload = {
        email_id: userData.email_id,
        FirstName: userData.FirstName || null,
        LastName: userData.LastName || null,
        role: userData.role || "admin",
        active: true,
        PhoneNo: userData.PhoneNo ? parseInt(userData.PhoneNo) : null
      };

      if (isNewUser) {
        const { data, error } = await supabase
          .from('UserMST')
          .insert([userPayload])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          setUsers([...users, data[0]]);
        }
        
        toast({
          title: "User added",
          description: "New user has been successfully added",
        });
      } else if (currentUserId) {
        const { error } = await supabase
          .from('UserMST')
          .update(userPayload)
          .eq('id', currentUserId);

        if (error) throw error;

        setUsers(users.map(user => 
          user.id === currentUserId 
            ? { ...user, ...userPayload } 
            : user
        ));
        
        toast({
          title: "User updated",
          description: "User has been successfully updated",
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "There was a problem saving the user",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    users,
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
  };
};
