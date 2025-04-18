
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
import { Switch } from "@/components/ui/switch";
import { Search, X } from "lucide-react";
import { Member } from "@/types/member";

const MemberManagement = () => {
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
        
        // Transform the data to add Active property with a default value of true
        const transformedData = data?.map(member => ({
          ...member,
          Active: true // Default value, since it doesn't exist in the database
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

  const clearFilters = () => {
    setSearchQuery("");
    setActiveFilter("all");
  };

  const toggleStatus = async (member: Member) => {
    try {
      const newActiveState = !member.Active;
      
      // Since 'Active' doesn't exist in the database, we'll just update the local state
      // In a real application, you might want to add the Active field to the database
      
      // Update the local state
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

  return (
    <ProtectedRoute allowedRoles={["controller"]}>
      <DashboardLayout title="Member Management">
        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="border rounded-md p-2"
              >
                <option value="all">All Members</option>
                <option value="active">Active Members</option>
                <option value="inactive">Inactive Members</option>
              </select>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {members.length} members
            </div>

            {loading ? (
              <div className="flex justify-center p-4">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">
                No members match your filters. Try adjusting your search criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.MemberFirstName} {member.MemberLastName}
                        </TableCell>
                        <TableCell>{member.MemberEmailId}</TableCell>
                        <TableCell>{member.MemberPhNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={member.Active} 
                              onCheckedChange={() => toggleStatus(member)}
                            />
                            <span className={member.Active ? "text-green-600" : "text-red-600"}>
                              {member.Active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MemberManagement;
