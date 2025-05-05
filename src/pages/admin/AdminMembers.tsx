
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MemberItem {
  id: number;
  MemberFirstName: string;
  MemberLastName: string;
  MemberEmailId: string;
  MemberPhNo: string;
  MemberStatus: boolean;
  MemberAdress: string;
  MemberPincode: string;
}

const AdminMembers = () => {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('MemberMST')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error fetching members",
          description: "There was a problem loading the member data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [toast]);
  
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="Member Management">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Manage Members</h2>
          
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No members found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">ID</th>
                        <th className="text-left pb-2">Name</th>
                        <th className="text-left pb-2">Email</th>
                        <th className="text-left pb-2">Phone</th>
                        <th className="text-left pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b">
                          <td className="py-3">{member.id}</td>
                          <td className="py-3">{member.MemberFirstName} {member.MemberLastName}</td>
                          <td className="py-3">{member.MemberEmailId}</td>
                          <td className="py-3">{member.MemberPhNo}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${member.MemberStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {member.MemberStatus ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              This is a basic view. In a future update, we'll add features to create, edit, and delete member records.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminMembers;
