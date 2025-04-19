
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
import { ExportButton } from "@/components/ui/export-button";
import { generateActiveMemberData, MemberDataPoint } from "@/utils/memberDataGenerator";
import { ChartControls } from "./controls/ChartControls";
import { EventAnnotations } from "./annotations/EventAnnotations";

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
        <ChartControls
          range={range}
          showRatio={showRatio}
          onRangeChange={setRange}
          onShowRatioChange={setShowRatio}
        />
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer
            config={{
              dam: { color: "#6E59A5" },
              mam: { color: "#9b87f5" },
              damMamRatio: { color: "#f59e0b" },
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
                
                {annotations.map((item, index) => (
                  <ReferenceLine
                    key={index}
                    x={item.formattedDate}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    yAxisId="left"
                    label={{ value: item.event, position: 'top', fill: '#10b981', fontSize: 12 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <EventAnnotations annotations={annotations} />
      </CardContent>
    </Card>
  );
};

export default ActiveMembersChart;
