
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArtistListView from "@/components/admin/artists/ArtistListView";
import ArtistAnalytics from "@/components/admin/artists/ArtistAnalytics";

const ArtistManagement = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <DashboardLayout title="Artist Management">
        <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">Artists List</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <ArtistListView />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <ArtistAnalytics />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ArtistManagement;
