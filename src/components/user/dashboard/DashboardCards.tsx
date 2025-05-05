
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number | React.ReactNode;
  description: string;
  loading?: boolean;
}

export const DashboardCard = ({ title, value, description, loading = false }: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? '...' : value}
        </div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

interface DashboardCardsProps {
  totalBookings: number;
  recentBookings: number;
  totalRevenue: number;
  loading: boolean;
}

export const DashboardCards = ({ 
  totalBookings, 
  recentBookings, 
  totalRevenue, 
  loading 
}: DashboardCardsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        title="Total Bookings"
        value={totalBookings}
        description="All time booking records"
        loading={loading}
      />
      <DashboardCard 
        title="Recent Bookings"
        value={recentBookings}
        description="Last 30 days"
        loading={loading}
      />
      <DashboardCard 
        title="Total Revenue"
        value={loading ? "" : <>INR {totalRevenue.toLocaleString()}</>}
        description="From completed services"
        loading={loading}
      />
    </div>
  );
};
