
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserAcquisitionChart from "./UserAcquisitionChart";
import UserRetentionHeatmap from "./UserRetentionHeatmap";
import ActiveUsersChart from "./ActiveUsersChart";

interface UserMetricsSectionProps {
  title?: string;
  description?: string;
}

const UserMetricsSection: React.FC<UserMetricsSectionProps> = ({
  title = "User Analytics",
  description = "Detailed metrics about user acquisition, retention, and engagement"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="acquisition" className="space-y-4">
          <TabsList>
            <TabsTrigger value="acquisition">User Acquisition</TabsTrigger>
            <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
            <TabsTrigger value="active">Active Users</TabsTrigger>
          </TabsList>
          <TabsContent value="acquisition" className="mt-4">
            <UserAcquisitionChart />
          </TabsContent>
          <TabsContent value="retention" className="mt-4">
            <UserRetentionHeatmap />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <ActiveUsersChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserMetricsSection;
