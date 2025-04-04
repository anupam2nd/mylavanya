
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";
import { Loader } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { ChartContainer } from "@/components/ui/chart";
import { Rupee } from "@/components/icons/Rupee";

interface RevenuePieChartProps {
  bookings: Booking[];
  loading: boolean;
  title: string;
  description: string;
}

// Custom colors for the pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const RevenuePieChart = ({ 
  bookings, 
  loading,
  title,
  description
}: RevenuePieChartProps) => {

  // Generate chart data by grouping revenue by service type
  const chartData = useMemo(() => {
    if (!bookings.length) return [];
    
    const completedBookings = bookings.filter(booking => 
      booking.Status === "done" || 
      booking.Status === "confirmed" || 
      booking.Status === "beautician_assigned"
    );
    
    if (!completedBookings.length) return [];
    
    const serviceMap = new Map<string, number>();
    
    completedBookings.forEach(booking => {
      const serviceName = booking.Purpose || booking.ServiceName || "Other";
      const price = booking.price || 0;
      
      if (serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, serviceMap.get(serviceName)! + price);
      } else {
        serviceMap.set(serviceName, price);
      }
    });
    
    return Array.from(serviceMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [bookings]);

  // Return loading state if applicable
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Return empty state if no data
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-80 text-center">
          <p className="text-muted-foreground">No revenue data available.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete bookings to see revenue distribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer 
          className="h-full w-full"
          config={{}}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenuePieChart;
