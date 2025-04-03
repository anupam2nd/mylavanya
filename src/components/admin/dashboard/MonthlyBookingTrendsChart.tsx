
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { parseISO, subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Loader } from "lucide-react";
import { Booking } from "@/hooks/useBookings";
import { ChartContainer } from "@/components/ui/chart";

interface MonthlyBookingData {
  name: string;
  bookings: number;
  month: Date;
}

interface MonthlyBookingTrendsChartProps {
  bookings: Booking[];
  loading: boolean;
}

const MonthlyBookingTrendsChart = ({ 
  bookings, 
  loading 
}: MonthlyBookingTrendsChartProps) => {

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
        bookings: 0,
        month: monthDate
      });
    }
    
    // Count bookings for each month based on creation date
    bookings.forEach(booking => {
      if (!booking.created_at) return;
      
      const bookingDate = parseISO(booking.created_at);
      
      // Check if the booking is within the last 6 months
      months.forEach(monthData => {
        const monthStart = startOfMonth(monthData.month);
        const monthEnd = endOfMonth(monthData.month);
        
        if (isWithinInterval(bookingDate, { start: monthStart, end: monthEnd })) {
          monthData.bookings += 1;
        }
      });
    });
    
    return months;
  }, [bookings]);

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
      <CardHeader>
        <CardTitle>Booking Trends (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ChartContainer
          className="h-full w-full"
          config={{
            bookings: {
              label: "Bookings",
              color: "#8884d8"
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
              <Line
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyBookingTrendsChart;
