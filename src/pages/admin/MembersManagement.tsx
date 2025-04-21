
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MembersListView from "@/components/admin/members/MembersListView";
import MemberAnalytics from "@/components/admin/members/MemberAnalytics";
import { useMemberManagement } from "@/hooks/useMemberManagement";

const MembersManagement = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
  const memberHook = useMemberManagement();

  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <DashboardLayout title="Members Management">
        <Tabs 
          defaultValue="list" 
          className="w-full" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="list">Members List</TabsTrigger>
            <TabsTrigger value="analytics">Member Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <MembersListView memberHook={memberHook} />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <MemberAnalytics />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MembersManagement;
