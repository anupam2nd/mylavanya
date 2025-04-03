import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { parseISO, isAfter, isBefore } from "date-fns";
import { Loader, Download } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { ChartContainer } from "@/components/ui/chart";
import { ExportButton } from "@/components/ui/export-button";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BeauticianData {
  name: string;
  bookings: number;
  revenue: number;
}

interface BeauticianBookingsBarChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate?: Date;
  endDate?: Date;
}

const BeauticianBookingsBarChart = ({ 
  bookings, 
  loading,
  startDate: externalStartDate,
  endDate: externalEndDate
}: BeauticianBookingsBarChartProps) => {
  const [dateType, setDateType] = useState<"creation" | "booking">("creation");
  const [limit, setLimit] = useState<number>(5);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [chartType, setChartType] = useState<"bookings" | "revenue">("bookings");

  const chartData = useMemo(() => {
    if (!bookings.length) return [];
    
    const activeBookings = bookings.filter(booking => 
      booking.Status !== "P" && 
      booking.Status !== "Pending" && 
      booking.Status !== "C" && 
      booking.Status !== "Cancelled" &&
      booking.Assignedto
    );
    
    const filteredBookings = activeBookings.filter(booking => {
      const dateField = dateType === "creation" 
        ? booking.created_at 
        : booking.Booking_date;
      
      if (!dateField) return false;
      
      const bookingDate = parseISO(dateField);
      
      if (externalStartDate && externalEndDate) {
        return isAfter(bookingDate, externalStartDate) && isBefore(bookingDate, externalEndDate);
      }
      
      return true;
    });
    
    const beauticianMap = new Map<string, BeauticianData>();
    
    filteredBookings.forEach(booking => {
      const beautician = booking.Assignedto || "Unknown";
      
      if (!beauticianMap.has(beautician)) {
        beauticianMap.set(beautician, {
          name: beautician,
          bookings: 0,
          revenue: 0
        });
      }
      
      const data = beauticianMap.get(beautician)!;
      data.bookings += 1;
      
      if (booking.price) {
        data.revenue += Number(booking.price);
      }
    });
    
    let result = Array.from(beauticianMap.values());
    
    result.sort((a, b) => {
      const valueA = chartType === "bookings" ? a.bookings : a.revenue;
      const valueB = chartType === "bookings" ? b.bookings : b.revenue;
      
      return sortOrder === "asc" 
        ? valueA - valueB 
        : valueB - valueA;
    });
    
    return result.slice(0, limit);
  }, [bookings, dateType, limit, sortOrder, chartType, externalStartDate, externalEndDate]);

  const exportData = chartData.map(item => ({
    Beautician: item.name,
    Bookings: item.bookings,
    Revenue: item.revenue,
  }));

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Beautician Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>
            {chartType === "bookings" ? "Beautician Bookings" : "Beautician Revenue"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Based on {dateType === "creation" ? "creation" : "booking"} date
          </p>
        </div>
        <div className="flex space-x-2 flex-wrap gap-2">
          <Select 
            defaultValue={dateType} 
            onValueChange={(value) => setDateType(value as "creation" | "booking")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Date type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creation">Creation Date</SelectItem>
              <SelectItem value="booking">Booking Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            defaultValue={String(limit)} 
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="15">Top 15</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            defaultValue={sortOrder} 
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            defaultValue={chartType} 
            onValueChange={(value) => setChartType(value as "bookings" | "revenue")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bookings">Bookings</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup>
                <ExportButton 
                  data={exportData} 
                  filename={`beautician_${chartType}_${dateType}`}
                  buttonText="Export to CSV"
                  variant="ghost"
                />
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer 
          className="h-full w-full" 
          config={{}}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)' }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Bar 
                dataKey={chartType === "bookings" ? "bookings" : "revenue"}
                name={chartType === "bookings" ? "Bookings" : "Revenue"}
                fill={chartType === "bookings" ? "#8884d8" : "#ff7300"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BeauticianBookingsBarChart;
