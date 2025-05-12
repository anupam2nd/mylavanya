import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  Sector
} from "recharts";
import { Loader } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { ChartContainer } from "@/components/ui/chart";

interface RevenuePieChartProps {
  bookings: Booking[];
  loading: boolean;
  title: string;
  description: string;
}

// Custom colors for the pie chart with a more professional palette
const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF'];

// Active sector rendering for enhanced interaction
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value 
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#888" className="text-xs">
        ₹{value.toLocaleString()}
      </text>
      <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#888" className="text-xs">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

const RevenuePieChart = ({ 
  bookings, 
  loading,
  title,
  description
}: RevenuePieChartProps) => {
  // State for active index to enhance interactivity
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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
    
    return Array.from(serviceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest revenue first
  }, [bookings]);

  // Calculate the total revenue
  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

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
      <CardContent className="h-80 relative">
        {totalRevenue > 0 && (
          <div className="absolute top-0 right-4 text-right">
            <p className="text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </div>
        )}
        <ChartContainer 
          className="h-full w-full"
          config={{}}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                onMouseEnter={onPieEnter}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry, index) => (
                  <span className="text-xs font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RevenuePieChart;
