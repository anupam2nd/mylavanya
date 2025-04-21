
import { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer } from "@/components/ui/chart";
import MemberRegistrationChart from "@/components/admin/members/MemberRegistrationChart";
import MemberRetentionHeatmap from "@/components/admin/members/MemberRetentionHeatmap";
import { generateActiveMemberData } from "@/utils/memberDataGenerator";

const MemberAnalytics = () => {
  const [registrationRange, setRegistrationRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [cohortRange, setCohortRange] = useState<'30d' | '90d' | '1y'>('90d');
  
  // Generate demo data for charts
  const memberRegistrationData = useMemo(() => 
    generateActiveMemberData(registrationRange), 
    [registrationRange]
  );
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="registration" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="registration">Registration Trends</TabsTrigger>
          <TabsTrigger value="retention">Retention Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registration" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>New Member Registration</CardTitle>
                <CardDescription>
                  Track new member sign-ups over time
                </CardDescription>
              </div>
              <Select 
                value={registrationRange} 
                onValueChange={(value: any) => setRegistrationRange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <MemberRegistrationChart data={memberRegistrationData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Member Retention Analysis</CardTitle>
                <CardDescription>
                  Cohort analysis showing member retention over time
                </CardDescription>
              </div>
              <Select 
                value={cohortRange} 
                onValueChange={(value: any) => setCohortRange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <MemberRetentionHeatmap range={cohortRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberAnalytics;
