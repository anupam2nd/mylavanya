
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { MemberFilters } from "@/components/admin/members/MemberFilters";
import { MembersTable } from "@/components/admin/members/MembersTable";
import { Member } from "@/types/member";
import { useToast } from "@/hooks/use-toast";

const MemberManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('MemberMST')
          .select('*');

        if (error) throw error;
        
        // Transform data to include Active state from MemberStatus
        const transformedData = data?.map(member => ({
          ...member,
          Active: member.MemberStatus || false
        })) as Member[];
        
        setMembers(transformedData);
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

  // Filter members based on search and active status
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      !searchQuery ||
      member.MemberFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.MemberLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.MemberEmailId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      activeFilter === "all" ||
      (activeFilter === "active" && member.Active) ||
      (activeFilter === "inactive" && !member.Active);

    return matchesSearch && matchesFilter;
  });

  const toggleStatus = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('MemberMST')
        .update({ MemberStatus: !member.Active })
        .eq('id', member.id);

      if (error) throw error;

      setMembers(members.map(m => 
        m.id === member.id 
          ? { ...m, Active: !m.Active } 
          : m
      ));

      toast({
        title: member.Active ? "Member deactivated" : "Member activated",
        description: `${member.MemberFirstName} ${member.MemberLastName} has been ${member.Active ? "deactivated" : "activated"}`,
      });
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  return (
    <ProtectedRoute allowedRoles={["superadmin", "controller"]}>
      <DashboardLayout title="Member Management">
        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onActiveFilterChange={setActiveFilter}
              onClearFilters={clearFilters}
              totalCount={members.length}
              filteredCount={filteredMembers.length}
            />

            {loading ? (
              <div className="flex justify-center p-4">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No members match your filters. Try adjusting your search criteria.
              </p>
            ) : (
              <MembersTable
                members={filteredMembers}
                onToggleStatus={toggleStatus}
              />
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MemberManagement;
