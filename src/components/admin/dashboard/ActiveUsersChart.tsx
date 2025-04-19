
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/ui/export-button";
import { Badge } from "@/components/ui/badge";
import { format, subDays } from "date-fns";

// Sample data - to be replaced with real data from MemberMST
const generateActiveMemberData = (range: string) => {
  const data = [];
  let periods = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const baseDam = 80; // Daily Active Members
  const baseMam = 500; // Monthly Active Members
  const damVariance = 20;
  const mamVariance = 100;
  
  const today = new Date();
  
  const events = [
    { date: '2025-02-01', name: 'Membership Drive', description: 'Annual membership promotion' },
    { date: '2025-03-15', name: 'New Features', description: 'Launched loyalty program' },
    { date: '2025-04-10', name: 'Spring Campaign', description: 'Seasonal member benefits' },
  ];
  
  // Increase member counts gradually over time
  for (let i = 0; i < periods; i++) {
    const date = subDays(today, periods - i - 1);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Add trend with some randomness
    const growthFactor = 1 + (i * 0.003); // 0.3% growth per day
    const dam = Math.floor((baseDam * growthFactor) + (Math.random() * damVariance - damVariance/2));
    const mam = Math.floor((baseMam * growthFactor) + (Math.random() * mamVariance - mamVariance/2));
    
    // Calculate DAM/MAM ratio
    const damMamRatio = (dam / mam * 100).toFixed(1);
    
    const dataPoint: any = {
      date: dateStr,
      formattedDate: format(date, 'MMM dd'),
      dam,
      mam,
      damMamRatio,
    };
    
    // Check if this date has an event
    const event = events.find(e => e.date === dateStr);
    if (event) {
      dataPoint.event = event.name;
      dataPoint.eventDescription = event.description;
    }
    
    data.push(dataPoint);
  }
  
  return data;
};

interface ActiveMembersChartProps {
  title?: string;
  description?: string;
}

const ActiveMembersChart: React.FC<ActiveMembersChartProps> = ({
  title = "Active Members",
  description = "Daily and Monthly Active Members with DAM/MAM ratio"
}) => {
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showRatio, setShowRatio] = useState(true);
  
  const data = generateActiveMemberData(range);

  // Find event annotations
  const annotations = data.filter(item => item.event);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <ExportButton
            data={data}
            filename="active_members"
            buttonText="Export"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Select value={range} onValueChange={(value: any) => setRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={showRatio ? "yes" : "no"} 
            onValueChange={(value) => setShowRatio(value === "yes")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="DAM/MAM Ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Show Ratio</SelectItem>
              <SelectItem value="no">Hide Ratio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer
            config={{
              dam: { 
                color: "#6E59A5" 
              },
              mam: { 
                color: "#9b87f5" 
              },
              damMamRatio: { 
                color: "#f59e0b" 
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="formattedDate" 
                  tickMargin={10}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  tickMargin={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 100']}
                />
                {showRatio && (
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                )}
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="dam"
                  name="Daily Active Members"
                  stroke="#6E59A5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mam"
                  name="Monthly Active Members"
                  stroke="#9b87f5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
                {showRatio && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="damMamRatio"
                    name="DAM/MAM Ratio (%)"
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                )}
                
                {/* Add event annotations */}
                {annotations.map((item, index) => (
                  <ReferenceLine
                    key={index}
                    x={item.formattedDate}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: item.event, position: 'top', fill: '#10b981', fontSize: 12 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {/* Event annotations legend */}
        {annotations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Events:</h4>
            <div className="flex flex-wrap gap-2">
              {annotations.map((item, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1 border-emerald-500">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="font-medium">{item.formattedDate} - {item.event}:</span> {item.eventDescription}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveMembersChart;
