
import { useMemo } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/export-button";
import { parseISO } from "date-fns";

interface CustomerDemographicsChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const CustomerDemographicsChart = ({ 
  bookings, 
  loading, 
  startDate, 
  endDate 
}: CustomerDemographicsChartProps) => {
  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return bookings;
    
    return bookings.filter(booking => {
      const date = booking.Booking_date ? parseISO(booking.Booking_date) : null;
      if (!date) return false;
      return date >= startDate && date <= endDate;
    });
  }, [bookings, startDate, endDate]);

  // Count unique customers and returning customers
  const customerData = useMemo(() => {
    const emailCounts: Record<string, number> = {};
    
    filteredBookings.forEach(booking => {
      if (!booking.email) return;
      emailCounts[booking.email] = (emailCounts[booking.email] || 0) + 1;
    });
    
    const uniqueCustomers = Object.keys(emailCounts).length;
    const returningCustomers = Object.values(emailCounts).filter(count => count > 1).length;
    const newCustomers = uniqueCustomers - returningCustomers;
    
    return [
      { name: "New Customers", value: newCustomers },
      { name: "Returning Customers", value: returningCustomers }
    ];
  }, [filteredBookings]);
  
  // Colors for different categories
  const COLORS = ['#4f46e5', '#10b981'];
  
  const chartConfig = {
    customer: { 
      theme: { 
        light: "#6366f1",
        dark: "#818cf8" 
      } 
    }
  };
  
  // Prepare export data
  const exportData = customerData.map(item => ({
    customerType: item.name,
    count: item.value
  }));

  const exportHeaders = {
    customerType: "Customer Type",
    count: "Count"
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Demographics</CardTitle>
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
          <CardTitle>Customer Demographics</CardTitle>
          <CardDescription>New vs returning customers</CardDescription>
        </div>
        <ExportButton 
          data={exportData}
          filename="customer_demographics"
          headers={exportHeaders}
          buttonText="Export Data"
        />
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {customerData.map((entry, index) => (
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
                              <span className="font-medium">{payload[0].name}:</span>
                              <span>{payload[0].value}</span>
                            </div>
                          )}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {customerData.map((item, index) => (
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

export default CustomerDemographicsChart;
