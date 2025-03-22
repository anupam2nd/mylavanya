
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { ExportButton } from "@/components/ui/export-button";
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns";

interface MonthlyBookingsChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const MonthlyBookingsChart = ({ 
  bookings, 
  loading,
  startDate,
  endDate
}: MonthlyBookingsChartProps) => {
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
          <CardTitle>Monthly Bookings</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Bookings</CardTitle>
          <CardDescription>Number of bookings per month</CardDescription>
        </div>
        <ExportButton 
          data={exportData}
          filename="monthly_bookings"
          headers={exportHeaders}
          buttonText="Export Data"
        />
      </CardHeader>
      <CardContent>
        {/* Reduced height to prevent overlapping */}
        <div className="h-[200px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 25, // Add more bottom margin for x-axis labels
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} // Smaller font size for x-axis labels
                  dy={8} // Adjust distance of labels from axis
                  angle={-45} // Angle the labels to prevent overlap
                  textAnchor="end" // Align angled text properly
                />
                <YAxis 
                  tick={{ fontSize: 12 }} // Smaller font size for y-axis labels
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
                <Bar 
                  dataKey="count" 
                  name="Bookings" 
                  fill="#8B5CF6" // Using a purple that matches the pie chart in the image
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyBookingsChart;
