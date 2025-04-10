
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { ExportButton } from "@/components/ui/export-button";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";

interface MonthlyBookingsLineChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const MonthlyBookingsLineChart = ({ 
  bookings, 
  loading,
  startDate,
  endDate
}: MonthlyBookingsLineChartProps) => {
  const chartConfig = {
    bookings: { 
      theme: { 
        light: "#6366f1",
        dark: "#818cf8"
      } 
    },
  };

  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return bookings;
    
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.Booking_date);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }, [bookings, startDate, endDate]);

  const monthlyData = useMemo(() => {
    const monthCounts: Record<string, number> = {};
    
    filteredBookings.forEach(booking => {
      if (!booking.Booking_date) return;
      
      const date = parseISO(booking.Booking_date);
      const monthKey = format(date, "MMM yyyy");
      
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    // Convert to array and sort by date
    return Object.entries(monthCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        // Sort by date (assuming format is "MMM yyyy")
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredBookings]);
  
  // Prepare export data
  const exportData = useMemo(() => {
    return monthlyData.map(item => ({
      month: item.name,
      bookings: item.count
    }));
  }, [monthlyData]);

  const exportHeaders = {
    month: "Month",
    bookings: "Number of Bookings"
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Bookings Trend</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Bookings Trend</CardTitle>
          <CardDescription>Number of bookings per month</CardDescription>
        </div>
        <ExportButton 
          data={exportData}
          filename="monthly_bookings_trend"
          headers={exportHeaders}
          buttonText="Export Data"
        />
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  dy={5}
                  angle={-45}
                  textAnchor="end"
                  height={30}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} bookings`, 'Bookings']}
                />
                <Line 
                  type="monotone"
                  dataKey="count" 
                  name="Bookings" 
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyBookingsLineChart;
