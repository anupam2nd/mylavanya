
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/ui/export-button";

// Sample data - to be replaced with real data
const generateRegistrationData = (period: string) => {
  const data = [];
  const periods = period === 'daily' ? 30 : period === 'weekly' ? 12 : 12;
  const baseCount = period === 'daily' ? 5 : period === 'weekly' ? 35 : 150;
  const variance = period === 'daily' ? 8 : period === 'weekly' ? 20 : 50;
  
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  for (let i = 0; i < periods; i++) {
    const currentValue = Math.max(0, baseCount + Math.floor(Math.random() * variance) - variance/2);
    const lastYearValue = Math.max(0, baseCount * 0.7 + Math.floor(Math.random() * variance) - variance/2);
    
    const label = period === 'daily' 
      ? `Day ${i+1}` 
      : period === 'weekly' 
        ? `Week ${i+1}` 
        : `Month ${i+1}`;
    
    data.push({
      name: label,
      [currentYear]: currentValue,
      [`${lastYear}`]: lastYearValue,
      organic: Math.floor(currentValue * 0.6),
      paid: Math.floor(currentValue * 0.25),
      referral: Math.floor(currentValue * 0.15),
    });
  }
  return data;
};

interface UserAcquisitionChartProps {
  title?: string;
  description?: string;
}

const UserAcquisitionChart: React.FC<UserAcquisitionChartProps> = ({
  title = "New User Registrations",
  description = "Track new user sign-ups over time with year-over-year comparison"
}) => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [showYoY, setShowYoY] = useState(true);
  const [channel, setChannel] = useState<'all' | 'organic' | 'paid' | 'referral'>('all');
  
  const data = generateRegistrationData(period);
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
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
            filename="user_registrations"
            buttonText="Export"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={channel} 
            onValueChange={(value: any) => setChannel(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="organic">Organic</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={showYoY ? "yes" : "no"} 
            onValueChange={(value) => setShowYoY(value === "yes")}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Compare" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Show YoY</SelectItem>
              <SelectItem value="no">Hide YoY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer
            config={{
              [currentYear]: { 
                color: "#9b87f5" 
              },
              [lastYear]: { 
                color: "#d6bcfa" 
              },
              organic: { 
                color: "#0ea5e9" 
              },
              paid: { 
                color: "#f97316" 
              },
              referral: { 
                color: "#10b981" 
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tickMargin={10}
                  tickLine={false}
                />
                <YAxis 
                  tickMargin={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                
                {channel === 'all' ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey={currentYear}
                      name={`${currentYear}`}
                      stroke="#9b87f5"
                      fill="#9b87f5"
                      fillOpacity={0.3}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                    />
                    {showYoY && (
                      <Area
                        type="monotone"
                        dataKey={lastYear}
                        name={`${lastYear}`}
                        stroke="#d6bcfa"
                        fill="#d6bcfa"
                        fillOpacity={0.2}
                        activeDot={{ r: 4 }}
                        isAnimationActive={true}
                      />
                    )}
                  </>
                ) : (
                  <Area
                    type="monotone"
                    dataKey={channel}
                    stroke={channel === 'organic' ? "#0ea5e9" : channel === 'paid' ? "#f97316" : "#10b981"}
                    fill={channel === 'organic' ? "#0ea5e9" : channel === 'paid' ? "#f97316" : "#10b981"}
                    fillOpacity={0.3}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAcquisitionChart;
