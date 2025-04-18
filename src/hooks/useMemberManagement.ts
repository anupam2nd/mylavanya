
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types/member";

export const useMemberManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('MemberMST')
          .select('*')
          .order('MemberFirstName', { ascending: true });

        if (error) throw error;
        
        const transformedData = data?.map(member => ({
          ...member,
          Active: true
        })) as Member[];
        
        setMembers(transformedData || []);
        setFilteredMembers(transformedData || []);
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
    };

    fetchMembers();
  }, [toast]);

  useEffect(() => {
    let result = [...members];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        member => 
          (member.MemberFirstName && member.MemberFirstName.toLowerCase().includes(query)) ||
          (member.MemberLastName && member.MemberLastName.toLowerCase().includes(query)) ||
          (member.MemberEmailId && member.MemberEmailId.toLowerCase().includes(query))
      );
    }
    
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      result = result.filter(member => member.Active === isActive);
    }
    
    setFilteredMembers(result);
  }, [members, searchQuery, activeFilter]);

  const toggleStatus = async (member: Member) => {
    try {
      const newActiveState = !member.Active;
      setMembers(members.map(m => 
        m.id === member.id 
          ? { ...m, Active: newActiveState } 
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

  return {
    members: filteredMembers,
    loading,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    toggleStatus
  };
};
