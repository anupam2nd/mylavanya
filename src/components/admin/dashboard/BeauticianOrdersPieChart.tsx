import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { parseISO, isWithinInterval, format } from "date-fns";
import { Loader } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { useStatusOptions } from "@/hooks/useStatusOptions";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BeauticianBookingsData {
  beautician: string;
  bookings: number;
  status: string;
  color: string;
}

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a4de6c", 
  "#d0ed57", "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d"
];

interface BeauticianOrdersPieChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate?: Date;
  endDate?: Date;
}

const BeauticianOrdersPieChart = ({ 
  bookings, 
  loading, 
  startDate, 
  endDate 
}: BeauticianOrdersPieChartProps) => {
  const { statusOptions } = useStatusOptions();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredData = useMemo(() => {
    if (!bookings.length) return [];
    
    // Filter bookings based on date range and only include assigned bookings
    const filtered = bookings.filter(booking => {
      // Only include bookings that have been assigned to a beautician
      if (!booking.Assignedto) return false;
      
      // Filter by date range if provided
      if (startDate && endDate && booking.created_at) {
        const bookingDate = parseISO(booking.created_at);
        return isWithinInterval(bookingDate, { start: startDate, end: endDate });
      }
      return true;
    });

    // Group the filtered bookings by beautician and status
    const beauticianStatusMap = new Map<string, Map<string, number>>();
    
    filtered.forEach(booking => {
      if (!booking.Assignedto) return;
      
      const beautician = booking.Assignedto;
      const status = booking.Status || "Unknown";

      if (!beauticianStatusMap.has(beautician)) {
        beauticianStatusMap.set(beautician, new Map<string, number>());
      }
      
      const statusMap = beauticianStatusMap.get(beautician)!;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    // Convert the grouped data into the format required by the pie chart
    const chartData: BeauticianBookingsData[] = [];
    let colorIndex = 0;
    
    beauticianStatusMap.forEach((statusMap, beautician) => {
      statusMap.forEach((count, status) => {
        chartData.push({
          beautician,
          status,
          bookings: count,
          color: COLORS[colorIndex % COLORS.length]
        });
        colorIndex++;
      });
    });

    return chartData.sort((a, b) => b.bookings - a.bookings);
  }, [bookings, startDate, endDate]);

  // Format status labels with proper names
  const getStatusLabel = (statusCode: string) => {
    const status = statusOptions.find(s => s.status_code === statusCode);
    return status ? status.status_name : statusCode;
  };

  // Return loading state or empty state if applicable
  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Orders by Beautician</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Orders by Beautician</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80 text-muted-foreground">
          No assigned bookings found in the selected date range
        </CardContent>
      </Card>
    );
  }

  // Custom name formatter for tooltip
  const nameFormatter = (value: string, entry: any) => {
    const statusLabel = getStatusLabel(entry.payload.status);
    return `${entry.payload.beautician}: ${statusLabel}`;
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Orders by Beautician</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer 
          className="h-full w-full" 
          config={{}}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                dataKey="bookings"
                nameKey="beautician"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const statusLabel = getStatusLabel(data.status);
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="font-medium">{data.beautician}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-muted-foreground">Status:</div>
                          <div>{statusLabel}</div>
                          <div className="text-muted-foreground">Orders:</div>
                          <div>{data.bookings}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              <Legend formatter={nameFormatter} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BeauticianOrdersPieChart;
