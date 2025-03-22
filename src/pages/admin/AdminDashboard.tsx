
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBookings } from "@/hooks/useBookings";
import BookingStatsPieChart from "@/components/admin/dashboard/BookingStatsPieChart"; 
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Sample data for the dashboard
const recentBookingsData = [
  { name: "Jan", count: 12 },
  { name: "Feb", count: 18 },
  { name: "Mar", count: 24 },
  { name: "Apr", count: 32 },
  { name: "May", count: 28 },
  { name: "Jun", count: 34 },
];

// Chart config for consistent styling
const chartConfig = {
  bookings: { theme: { light: "#6366f1" } },
};

const AdminDashboard = () => {
  const { bookings, loading } = useBookings();

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <DashboardLayout title="Dashboard">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                All time booking records
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : 
                  bookings.filter(booking => {
                    // Get bookings from the last 30 days
                    const date = new Date(booking.Booking_date);
                    const now = new Date();
                    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
                    return date >= thirtyDaysAgo;
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Confirmation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : 
                  bookings.filter(booking => booking.Status === "P").length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Bookings requiring your action
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {/* Booking Stats Pie Chart */}
          <BookingStatsPieChart bookings={bookings} loading={loading} />

          {/* Monthly Bookings Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Bookings</CardTitle>
              <CardDescription>Number of bookings per month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={recentBookingsData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
