
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { parseISO, subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Loader, Download } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { ChartContainer } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
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

interface MonthlyBookingData {
  name: string;
  month: Date;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

interface MonthlyBookingTrendsChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate?: Date;
  endDate?: Date;
}

const MonthlyBookingTrendsChart = ({ 
  bookings, 
  loading,
  startDate: externalStartDate,
  endDate: externalEndDate
}: MonthlyBookingTrendsChartProps) => {
  const [dateType, setDateType] = useState<"creation" | "booking">("creation");
  const [showRevenue, setShowRevenue] = useState<boolean>(true);

  const chartData = useMemo(() => {
    if (!bookings.length) return [];
    
    // Calculate the date 6 months ago from today
    const today = new Date();
    
    // Create an array of the last 6 months
    const months: MonthlyBookingData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      months.push({
        name: format(monthDate, 'MMM yyyy'),
        month: monthDate,
        totalBookings: 0,
        confirmedBookings: 0,
        totalRevenue: 0
      });
    }
    
    // Count bookings for each month based on the selected date type
    bookings.forEach(booking => {
      const dateField = dateType === "creation" 
        ? booking.created_at 
        : booking.Booking_date;
      
      if (!dateField) return;
      
      const bookingDate = parseISO(dateField);
      
      // Check if external date filters are applied
      if (externalStartDate && externalEndDate) {
        if (
          bookingDate < externalStartDate ||
          bookingDate > externalEndDate
        ) {
          return; // Skip if outside the filter range
        }
      }
      
      // Check if the booking is within the last 6 months
      months.forEach(monthData => {
        const monthStart = startOfMonth(monthData.month);
        const monthEnd = endOfMonth(monthData.month);
        
        if (isWithinInterval(bookingDate, { start: monthStart, end: monthEnd })) {
          monthData.totalBookings += 1;
          
          // Count confirmed bookings (not pending or cancelled)
          if (
            booking.Status !== "P" && 
            booking.Status !== "Pending" && 
            booking.Status !== "C" && 
            booking.Status !== "Cancelled"
          ) {
            monthData.confirmedBookings += 1;
            
            // Sum up the price for revenue calculation
            if (booking.price) {
              monthData.totalRevenue += Number(booking.price);
            }
          }
        }
      });
    });
    
    return months;
  }, [bookings, dateType, externalStartDate, externalEndDate]);

  // Prepare export data
  const exportData = chartData.map(month => ({
    Month: month.name,
    'Total Bookings': month.totalBookings,
    'Confirmed Bookings': month.confirmedBookings,
    'Total Revenue': month.totalRevenue,
  }));

  // Return loading state if applicable
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Booking Trends (Last 6 Months)</CardTitle>
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
          <CardTitle>Booking Trends (Last 6 Months)</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Based on {dateType === "creation" ? "creation" : "booking"} date
          </p>
        </div>
        <div className="flex space-x-2">
          <Select 
            defaultValue={dateType} 
            onValueChange={(value) => setDateType(value as "creation" | "booking")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creation">Creation Date</SelectItem>
              <SelectItem value="booking">Booking Date</SelectItem>
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
                  filename={`booking_trends_${dateType}`}
                  buttonText="Export to CSV"
                  variant="ghost"
                />
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={() => setShowRevenue(!showRevenue)}
          >
            {showRevenue ? "Hide Revenue" : "Show Revenue"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          className="h-full w-full"
          config={{
            totalBookings: {
              label: "Total Bookings",
              color: "#8884d8"
            },
            confirmedBookings: {
              label: "Confirmed Bookings",
              color: "#82ca9d"
            },
            totalRevenue: {
              label: "Revenue",
              color: "#ff7300"
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              <YAxis 
                yAxisId="left"
                allowDecimals={false}
                tick={{ fill: 'var(--muted-foreground)' }}
              />
              {showRevenue && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'var(--muted-foreground)' }}
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalBookings"
                name="Total Bookings"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                yAxisId="left"
              />
              <Line
                type="monotone"
                dataKey="confirmedBookings"
                name="Confirmed Bookings"
                stroke="#82ca9d"
                activeDot={{ r: 6 }}
                strokeWidth={2}
                yAxisId="left"
              />
              {showRevenue && (
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  name="Revenue"
                  stroke="#ff7300"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                  yAxisId="right"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyBookingTrendsChart;
