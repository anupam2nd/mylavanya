
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingStatsPieChartProps {
  bookings: Booking[];
  loading: boolean;
}

export const BookingStatsPieChart = ({ bookings, loading }: BookingStatsPieChartProps) => {
  const statusData = useMemo(() => {
    // Group bookings by status
    const statusCounts: Record<string, number> = {};
    
    bookings.forEach(booking => {
      const status = booking.Status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Convert to array format needed by recharts
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [bookings]);
  
  // Colors for different status types
  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  
  const chartConfig = {
    status: { 
      theme: { 
        light: "#6366f1",
        dark: "#818cf8" 
      } 
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 shadow-md"
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{name}:</span>
                            <span>{value} bookings</span>
                          </div>
                        )}
                      />
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ChartContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {statusData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex w-full justify-between">
                <span className="text-xs text-muted-foreground">{item.name}</span>
                <span className="text-xs font-medium">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingStatsPieChart;
