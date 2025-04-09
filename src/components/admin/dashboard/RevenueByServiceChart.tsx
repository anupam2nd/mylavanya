
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { parseISO } from "date-fns";
import { ExportButton } from "@/components/ui/export-button";
import { Rupee } from "@/components/icons/Rupee";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RevenueByServiceChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate?: Date;
  endDate?: Date;
}

type RevenueData = {
  service_name: string;
  total_revenue: number;
};

export const RevenueByServiceChart = ({ 
  bookings, 
  loading,
  startDate,
  endDate
}: RevenueByServiceChartProps) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Fetch revenue data from Supabase using the RPC function
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setDataLoading(true);
        
        // Call the RPC function to get revenue by service
        const { data, error } = await (supabase.rpc as any)(
          'get_revenue_by_service'
        ) as { data: RevenueData[] | null; error: any };
        
        if (error) {
          console.error("Error fetching revenue data:", error);
          throw error;
        }
        
        if (data) {
          setRevenueData(data);
        }
      } catch (error) {
        console.error("Error in fetchRevenueData:", error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchRevenueData();
  }, []);

  // Filter revenue data based on date range
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) {
      // If no date range, use the data from RPC
      return revenueData.map(item => ({
        name: item.service_name || "Unknown Service",
        value: item.total_revenue
      }));
    }
    
    // Manual calculation using filtered bookings
    const serviceRevenue: Record<string, number> = {};
    
    const filteredBookings = bookings.filter(booking => {
      if (!booking.Booking_date || !booking.Status) return false;
      
      const bookingDate = parseISO(booking.Booking_date);
      const isCompletedStatus = booking.Status === 'done';
      
      return isCompletedStatus && bookingDate >= startDate && bookingDate <= endDate;
    });
    
    filteredBookings.forEach(booking => {
      const serviceName = booking.ServiceName || booking.Purpose || "Unknown Service";
      const price = booking.price || 0;
      
      serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + price;
    });
    
    return Object.entries(serviceRevenue)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [revenueData, bookings, startDate, endDate]);

  // Colors for different services
  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  
  const chartConfig = {
    revenue: { 
      theme: { 
        light: "#6366f1",
        dark: "#818cf8" 
      } 
    }
  };
  
  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.value, 0);
  }, [filteredData]);
  
  // Prepare export data
  const exportData = useMemo(() => {
    return filteredData.map(item => ({
      service: item.name,
      revenue: item.value
    }));
  }, [filteredData]);

  const exportHeaders = {
    service: "Service",
    revenue: "Revenue (₹)"
  };

  if (loading || dataLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Service</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-muted-foreground">Loading revenue data...</p>
        </CardContent>
      </Card>
    );
  }
  
  // Handle empty data
  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Service</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex flex-col justify-center items-center">
          <p className="text-muted-foreground mb-2">No revenue data available</p>
          <p className="text-sm text-muted-foreground">Complete bookings to see revenue breakdown</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Revenue by Service</CardTitle>
          <div className="flex items-center mt-1">
            <Rupee className="h-5 w-5 mr-1 text-primary" />
            <span className="text-2xl font-bold">{totalRevenue.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground ml-2">total revenue</span>
          </div>
        </div>
        <ExportButton 
          data={exportData}
          filename="revenue_by_service"
          headers={exportHeaders}
          buttonText="Export Data"
        />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      return (
                        <ChartTooltipContent
                          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 shadow-md"
                          formatter={(value) => (
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium mr-2">{item.name}:</span>
                              <span className="flex items-center">
                                <Rupee className="h-3 w-3 mr-0.5" />
                                {value.toLocaleString()}
                              </span>
                            </div>
                          )}
                        />
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filteredData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex w-full justify-between items-center">
                <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                <span className="text-xs font-medium flex items-center">
                  <Rupee className="h-2.5 w-2.5 mr-0.5" />
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueByServiceChart;
