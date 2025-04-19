
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/ui/export-button";
import { format } from "date-fns";

// Generate sample retention data
const generateRetentionData = () => {
  const months = 12;
  const weeksToTrack = 10;
  const data = [];

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthLabel = format(date, 'MMM yyyy');
    
    const rowData: any = {
      cohort: monthLabel,
      size: Math.floor(Math.random() * 500) + 100,
    };

    for (let week = 0; week < weeksToTrack; week++) {
      // First week is always 100%
      if (week === 0) {
        rowData[`week${week}`] = 100;
      } else {
        // Retention generally declines over time
        const baseRetention = 95 - (week * 5); // Starting high and decreasing
        // Add some randomness, ensure it doesn't go below 0
        const randomVariance = Math.floor(Math.random() * 10) - 5;
        rowData[`week${week}`] = Math.max(0, Math.min(100, baseRetention + randomVariance));
      }
    }
    
    data.push(rowData);
  }
  
  return data;
};

interface UserRetentionHeatmapProps {
  title?: string;
  description?: string;
}

const UserRetentionHeatmap: React.FC<UserRetentionHeatmapProps> = ({
  title = "User Retention by Cohort",
  description = "Heatmap showing retention rates across different user cohorts over time"
}) => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const data = generateRetentionData();
  
  // Create columns for the heatmap
  const weeks = Array.from({ length: 10 }, (_, i) => `Week ${i+1}`);
  
  // Color function to determine cell background
  const getColor = (value: number) => {
    if (value >= 90) return 'bg-purple-900 text-white';
    if (value >= 80) return 'bg-purple-800 text-white';
    if (value >= 70) return 'bg-purple-700 text-white';
    if (value >= 60) return 'bg-purple-600 text-white';
    if (value >= 50) return 'bg-purple-500 text-white';
    if (value >= 40) return 'bg-purple-400 text-white';
    if (value >= 30) return 'bg-purple-300 text-gray-800';
    if (value >= 20) return 'bg-purple-200 text-gray-800';
    if (value >= 10) return 'bg-purple-100 text-gray-800';
    return 'bg-purple-50 text-gray-800';
  };
  
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
            filename="user_retention"
            buttonText="Export"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left bg-gray-50 font-medium text-gray-600">Cohort</th>
                <th className="py-2 px-4 text-left bg-gray-50 font-medium text-gray-600">Size</th>
                {weeks.map((week, index) => (
                  <th key={index} className="py-2 px-4 text-left bg-gray-50 font-medium text-gray-600">
                    {week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-4 font-medium">{row.cohort}</td>
                  <td className="py-2 px-4">{row.size}</td>
                  {weeks.map((_, weekIndex) => {
                    const value = row[`week${weekIndex}`];
                    return (
                      <td key={weekIndex} className="py-2 px-4">
                        <div 
                          className={`h-8 flex items-center justify-center rounded ${getColor(value)}`}
                          title={`${row.cohort}: ${value}% retained after ${weekIndex + 1} ${period === 'weekly' ? 'weeks' : 'months'}`}
                        >
                          {value}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Lower</span>
            <div className="flex space-x-1">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div
                  key={shade}
                  className={`h-4 w-4 bg-purple-${shade} ${shade < 400 ? 'text-gray-800' : 'text-white'}`}
                ></div>
              ))}
            </div>
            <span className="text-sm text-gray-500">Higher</span>
            <span className="ml-2 text-sm text-gray-500">Retention %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRetentionHeatmap;
