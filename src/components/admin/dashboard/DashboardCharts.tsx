
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import MonthlyBookingsChart from "@/components/admin/dashboard/MonthlyBookingsChart";
import MonthlyBookingsLineChart from "@/components/admin/dashboard/MonthlyBookingsLineChart";
import MonthlyBookingTrendsChart from "@/components/admin/dashboard/MonthlyBookingTrendsChart";
import BookingStatusPieChart from "@/components/admin/dashboard/BookingStatusPieChart";
import CustomerDemographicsChart from "@/components/admin/dashboard/CustomerDemographicsChart";
import RevenueByServiceChart from "@/components/admin/dashboard/RevenueByServiceChart";
import { Booking } from "@/hooks/useBookings";

interface DashboardChartsProps {
  bookings: Booking[];
  loading: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  bookings,
  loading,
  startDate,
  endDate
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 mt-2">
      <Card className="col-span-1">
        <CardContent className="p-6">
          <MonthlyBookingsLineChart 
            startDate={startDate} 
            endDate={endDate}
            bookings={bookings}
            loading={loading}
          />
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardContent className="p-6">
          <BookingStatusPieChart 
            startDate={startDate} 
            endDate={endDate} 
            bookings={bookings} 
            loading={loading}
            title="Booking Status Distribution"
            description="Current status of all bookings"
            filterField="Booking_date"
          />
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardContent className="p-6">
          <RevenueByServiceChart 
            bookings={bookings}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
          />
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardContent className="p-6">
          <CustomerDemographicsChart 
            startDate={startDate} 
            endDate={endDate}
            bookings={bookings}
            loading={loading}
          />
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardContent className="p-6">
          <MonthlyBookingTrendsChart 
            startDate={startDate} 
            endDate={endDate} 
            bookings={bookings} 
            loading={loading}
          />
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardContent className="p-6">
          <MonthlyBookingsChart 
            startDate={startDate} 
            endDate={endDate}
            bookings={bookings}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};
