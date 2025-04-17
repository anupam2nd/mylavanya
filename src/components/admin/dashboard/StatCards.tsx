
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, CalendarCheck, Clock, Activity, Banknote, Layers } from "lucide-react";
import { Rupee } from "@/components/icons/Rupee";

interface StatCardsProps {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  totalServices: number;
  totalRevenue: number;
  loading?: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalBookings,
  pendingBookings,
  completedBookings,
  inProgressBookings,
  totalServices,
  totalRevenue,
  loading = false
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : totalBookings}</div>
          <p className="text-xs text-muted-foreground">Unique bookings in the system</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : pendingBookings}</div>
          <p className="text-xs text-muted-foreground">Awaiting approval or assignment</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : inProgressBookings}</div>
          <p className="text-xs text-muted-foreground">Currently being serviced</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : completedBookings}</div>
          <p className="text-xs text-muted-foreground">Successfully completed bookings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : totalServices}</div>
          <p className="text-xs text-muted-foreground">Unique services offered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <Rupee className="h-5 w-5 mr-0.5" />
            {loading ? "..." : totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">From completed services</p>
        </CardContent>
      </Card>
    </div>
  );
};
