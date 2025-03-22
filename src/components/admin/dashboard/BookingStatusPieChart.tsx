
import { useMemo, useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Booking } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/export-button";
import { parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStatusOptions } from "@/hooks/useStatusOptions";

interface BookingStatusPieChartProps {
  bookings: Booking[];
  loading: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
  title: string;
  description: string;
  filterField: "Booking_date" | "created_at";
}

export const BookingStatusPieChart = ({ 
  bookings, 
  loading, 
  startDate,
  endDate,
  title,
  description,
  filterField
}: BookingStatusPieChartProps) => {
  const { statusOptions } = useStatusOptions();
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    if (!startDate || !endDate) return bookings;
    
    return bookings.filter(booking => {
      const date = booking[filterField] ? parseISO(booking[filterField] as string) : null;
      if (!date) return false;
      return date >= startDate && date <= endDate;
    });
  }, [bookings, startDate, endDate, filterField]);

  // Group bookings by status
  const statusData = useMemo(() => {
    const statusCounts: Record<string, { count: number, bookings: Booking[] }> = {};
    
    filteredBookings.forEach(booking => {
      const status = booking.Status || "Unknown";
      if (!statusCounts[status]) {
        statusCounts[status] = { count: 0, bookings: [] };
      }
      statusCounts[status].count += 1;
      statusCounts[status].bookings.push(booking);
    });
    
    // Convert to array format and include status name from statusOptions
    return Object.entries(statusCounts).map(([code, data]) => {
      const statusOption = statusOptions.find(option => option.status_code === code);
      return { 
        code,
        name: statusOption?.status_name || code, 
        description: statusOption?.description || "Unknown status", 
        value: data.count,
        bookings: data.bookings
      };
    });
  }, [filteredBookings, statusOptions]);
  
  // Colors for different status types
  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  
  const chartConfig = {
    status: { 
      theme: { 
        light: "#6366f1",
        dark: "#818cf8" 
      } 
    }
  };

  // Handle sector hover in the pie chart
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  // Handle click on pie chart segment
  const handlePieClick = (data: any, index: number) => {
    setSelectedStatus(data.code);
    setIsDetailOpen(true);
  };
  
  // Prepare export data for selected status
  const selectedStatusBookings = useMemo(() => {
    if (!selectedStatus) return [];
    const statusItem = statusData.find(item => item.code === selectedStatus);
    return statusItem ? statusItem.bookings : [];
  }, [selectedStatus, statusData]);
  
  // Export headers for the CSV - using Partial to indicate we're only including a subset of fields
  const bookingExportHeaders: Partial<Record<keyof Booking, string>> = {
    Booking_NO: "Booking Number",
    name: "Customer Name",
    email: "Email",
    Phone_no: "Phone Number",
    Booking_date: "Booking Date",
    booking_time: "Booking Time",
    Purpose: "Purpose",
    Status: "Status Code",
    price: "Price",
    created_at: "Created At"
  };

  // Custom active shape for clickable pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ExportButton 
            data={filteredBookings}
            filename={`status_distribution_${filterField}`}
            headers={bookingExportHeaders}
            buttonText="Export Data"
          />
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  onClick={handlePieClick}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  className="cursor-pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <ChartTooltipContent
                          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 shadow-md"
                          formatter={(value, name) => (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">{item.name}:</span>
                                <span>{item.value} bookings</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                              <p className="text-xs">Click for details</p>
                            </div>
                          )}
                        />
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {statusData.map((item, index) => (
              <div 
                key={item.code} 
                className="flex items-start gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => {
                  setSelectedStatus(item.code);
                  setIsDetailOpen(true);
                }}
              >
                <div 
                  className="h-3 w-3 rounded-full mt-1" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex flex-col w-full">
                  <div className="flex w-full justify-between">
                    <span className="text-xs font-medium">{item.name}</span>
                    <span className="text-xs">{item.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {statusData.find(s => s.code === selectedStatus)?.name} Bookings
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-end mb-4">
            <ExportButton 
              data={selectedStatusBookings}
              filename={`bookings_status_${selectedStatus}`}
              headers={bookingExportHeaders}
              buttonText="Export Selected"
              variant="outline"
            />
          </div>
          
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedStatusBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.Booking_NO}</TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>{booking.Booking_date}</TableCell>
                    <TableCell>{booking.booking_time}</TableCell>
                    <TableCell>{booking.Purpose}</TableCell>
                    <TableCell>₹{booking.price}</TableCell>
                  </TableRow>
                ))}
                {selectedStatusBookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No bookings found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingStatusPieChart;
