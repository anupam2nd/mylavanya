
import BookingStatusPieChart from "@/components/admin/dashboard/BookingStatusPieChart";
import RevenuePieChart from "@/components/user/RevenuePieChart";
import { Booking } from "@/hooks/useBookings";

interface DashboardChartsProps {
  filteredBookings: Booking[];
  allBookings: Booking[];
  loading: boolean;
  startDate?: Date;
  endDate?: Date;
}

export const DashboardCharts = ({
  filteredBookings,
  allBookings,
  loading,
  startDate,
  endDate
}: DashboardChartsProps) => {
  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
      <RevenuePieChart 
        bookings={filteredBookings} 
        loading={loading}
        title="Revenue by Service"
        description="Distribution of revenue by service type"
      />

      <BookingStatusPieChart 
        bookings={allBookings} 
        loading={loading} 
        startDate={startDate}
        endDate={endDate}
        title="Status by Booking Date"
        description="Distribution based on when services are scheduled"
        filterField="Booking_date"
      />
    </div>
  );
};
