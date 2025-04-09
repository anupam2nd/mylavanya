
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { parseISO, format } from "date-fns";
import { ExportButton } from "@/components/ui/export-button";

interface MonthlyBookingTrendsChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const MonthlyBookingTrendsChart = ({ 
  bookings, 
  loading,
  startDate,
  endDate
}: MonthlyBookingTrendsChartProps) => {
  
  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return bookings;
    
    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.Booking_date);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }, [bookings, startDate, endDate]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { total: number, confirmed: number, completed: number }> = {};
    
    // Initialize with empty values
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = format(date, "MMM yyyy");
      monthlyData[monthKey] = { total: 0, confirmed: 0, completed: 0 };
    }
    
    // Populate with actual data
    filteredBookings.forEach(booking => {
      if (!booking.Booking_date) return;
      
      const date = parseISO(booking.Booking_date);
      const monthKey = format(date, "MMM yyyy");
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, confirmed: 0, completed: 0 };
      }
      
      monthlyData[monthKey].total += 1;
      
      if (booking.Status === 'confirmed' || booking.Status === 'done' || booking.Status === 'beautician_assigned') {
        monthlyData[monthKey].confirmed += 1;
      }
      
      if (booking.Status === 'done') {
        monthlyData[monthKey].completed += 1;
      }
    });
    
    // Convert to array for recharts
    return Object.entries(monthlyData)
      .map(([name, data]) => ({
        name,
        ...data
      }))
      .sort((a, b) => {
        // Sort by date (assuming format is "MMM yyyy")
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredBookings]);

  const chartConfig = {
    total: { 
      theme: { 
        light: "#6366f1",
        dark: "#818cf8" 
      } 
    },
    confirmed: { 
      theme: { 
        light: "#10b981",
        dark: "#34d399" 
      } 
    },
    completed: { 
      theme: { 
        light: "#f59e0b",
        dark: "#fbbf24" 
      } 
    },
  };
  
  // Prepare export data
  const exportData = useMemo(() => {
    return chartData.map(item => ({
      month: item.name,
      total: item.total,
      confirmed: item.confirmed,
      completed: item.completed
    }));
  }, [chartData]);

  const exportHeaders = {
    month: "Month",
    total: "Total Bookings",
    confirmed: "Confirmed Bookings",
    completed: "Completed Bookings"
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Booking Trends</CardTitle>
          <CardDescription>Loading statistics...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Booking Trends</CardTitle>
          <CardDescription>Total, confirmed and completed bookings</CardDescription>
        </div>
        <ExportButton 
          data={exportData}
          filename="monthly_booking_trends"
          headers={exportHeaders}
          buttonText="Export Data"
        />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 30, // Increased bottom margin for x-axis labels
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} // Smaller font for labels
                  dy={5} // Distance from axis
                  angle={-45} // Angle the labels
                  textAnchor="end" // Align angled text
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
                />
                <Legend />
                <Bar 
                  dataKey="total" 
                  name="Total" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="confirmed" 
                  name="Confirmed" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="completed" 
                  name="Completed" 
                  fill="#f59e0b" 
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

export default MonthlyBookingTrendsChart;
