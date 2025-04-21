
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types/member";

interface MemberSort {
  column: keyof Member;
  direction: 'asc' | 'desc';
}

export const useMemberManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<MemberSort>({ column: 'id', direction: 'asc' });

  // Fetch all members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('MemberMST')
        .select('*')
        .order('MemberFirstName', { ascending: true });

      if (error) throw error;
      
      const transformedData = data?.map(member => ({
        ...member,
        Active: member.MemberStatus || false
      })) as Member[];
      
      setMembers(transformedData || []);
      setFilteredMembers(transformedData || []);
      setTotalPages(Math.ceil((transformedData || []).length / pageSize));
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Failed to load members",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, pageSize]);

  // Fetch a single member by ID
  const fetchMemberById = async (id: number): Promise<Member | null> => {
    try {
      const { data, error } = await supabase
        .from('MemberMST')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        Active: data.MemberStatus || false
      } as Member;
    } catch (error) {
      console.error(`Error fetching member id ${id}:`, error);
      toast({
        title: "Failed to load member details",
        description: "Please try again later",
        variant: "destructive"
      });
      return null;
    }
  };

  // Create a new member
  const createMember = async (member: Partial<Member>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('MemberMST')
        .insert([{
          MemberFirstName: member.MemberFirstName,
          MemberLastName: member.MemberLastName,
          MemberEmailId: member.MemberEmailId,
          MemberPhNo: member.MemberPhNo,
          MemberAdress: member.MemberAdress,
          MemberPincode: member.MemberPincode,
          MemberDOB: member.MemberDOB,
          MemberSex: member.MemberSex,
          MemberStatus: member.Active
        }])
        .select();

      if (error) throw error;
      
      toast({
        title: "Member created",
        description: `Member "${member.MemberFirstName} ${member.MemberLastName}" has been created successfully.`,
      });
      
      fetchMembers();
      return true;
    } catch (error) {
      console.error('Error creating member:', error);
      toast({
        title: "Failed to create member",
        description: "Please check your input and try again",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update an existing member
  const updateMember = async (member: Member): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('MemberMST')
        .update({
          MemberFirstName: member.MemberFirstName,
          MemberLastName: member.MemberLastName,
          MemberEmailId: member.MemberEmailId,
          MemberPhNo: member.MemberPhNo,
          MemberAdress: member.MemberAdress,
          MemberPincode: member.MemberPincode,
          MemberDOB: member.MemberDOB,
          MemberSex: member.MemberSex,
          MemberStatus: member.Active
        })
        .eq('id', member.id);

      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === member.id ? member : m
      ));
      
      toast({
        title: "Member updated",
        description: `Member "${member.MemberFirstName} ${member.MemberLastName}" has been updated.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Failed to update member",
        description: "Please try again later",
        variant: "destructive"
      });
      return false;
    }
  };

  // Toggle active status
  const toggleStatus = async (member: Member) => {
    try {
      const newActiveState = !member.Active;
      const { error } = await supabase
        .from('MemberMST')
        .update({ MemberStatus: newActiveState })
        .eq('id', member.id);

      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === member.id 
          ? { ...m, Active: newActiveState, MemberStatus: newActiveState } 
          : m
      ));
      
      toast({
        title: newActiveState ? "Member activated" : "Member deactivated",
        description: `Member "${member.MemberFirstName} ${member.MemberLastName}" has been ${newActiveState ? "activated" : "deactivated"}`,
      });
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update the member status",
        variant: "destructive",
      });
    }
  };

  // Bulk toggle status
  const bulkToggleStatus = async (ids: number[], status: boolean) => {
    try {
      const { error } = await supabase
        .from('MemberMST')
        .update({ MemberStatus: status })
        .in('id', ids);

      if (error) throw error;
      
      setMembers(members.map(m => 
        ids.includes(m.id)
          ? { ...m, Active: status, MemberStatus: status } 
          : m
      ));
      
      toast({
        title: status ? "Members activated" : "Members deactivated",
        description: `${ids.length} members have been ${status ? "activated" : "deactivated"}`,
      });
      
      setSelectedMembers([]);
    } catch (error) {
      console.error('Error updating member statuses:', error);
      toast({
        title: "Error",
        description: "Failed to update member statuses",
        variant: "destructive",
      });
    }
  };

  // Delete a member (soft delete by setting status to false)
  const deleteMember = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('MemberMST')
        .update({ MemberStatus: false })
        .eq('id', member.id);

      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === member.id 
          ? { ...m, Active: false, MemberStatus: false } 
          : m
      ));
      
      toast({
        title: "Member deleted",
        description: `Member "${member.MemberFirstName} ${member.MemberLastName}" has been deactivated.`,
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error",
        description: "Failed to delete the member",
        variant: "destructive",
      });
    }
  };

  // Sort members
  const sortMembers = (column: keyof Member) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.column === column) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    setSortConfig({ column, direction });
  };

  // Toggle member selection
  const toggleSelectMember = (id: number) => {
    setSelectedMembers(prev => 
      prev.includes(id) 
        ? prev.filter(memberId => memberId !== id) 
        : [...prev, id]
    );
  };

  // Handle pagination
  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  // Change items per page
  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
    setSortConfig({ column: 'id', direction: 'asc' });
  };

  // Apply all filters and sorting
  useEffect(() => {
    let result = [...members];
    
    // Apply search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        member => 
          (member.MemberFirstName && member.MemberFirstName.toLowerCase().includes(query)) ||
          (member.MemberLastName && member.MemberLastName.toLowerCase().includes(query)) ||
          (member.MemberEmailId && member.MemberEmailId.toLowerCase().includes(query)) ||
          (member.MemberPhNo && member.MemberPhNo.toLowerCase().includes(query))
      );
    }
    
    // Apply status filtering
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter(member => member.Active === isActive);
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      const aValue = a[sortConfig.column];
      const bValue = b[sortConfig.column];
      
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? (aValue < bValue ? -1 : 1) 
        : (bValue < aValue ? -1 : 1);
    });
    
    setFilteredMembers(result);
    setTotalPages(Math.ceil(result.length / pageSize));
  }, [members, searchQuery, activeFilter, sortConfig, pageSize]);

  // Fetch members on initial load
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Get paginated data
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return {
    members: filteredMembers,
    paginatedMembers,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    page,
    pageSize,
    totalPages,
    goToPage,
    changePageSize,
    sortConfig,
    sortMembers,
    selectedMembers,
    toggleSelectMember,
    bulkToggleStatus,
    toggleStatus,
    createMember,
    updateMember,
    deleteMember,
    fetchMemberById,
    clearFilters,
    totalMembers: filteredMembers.length,
    overallTotal: members.length
  };
};
