
import { useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, IndianRupee, Plus, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { parseISO, format, isAfter } from "date-fns";
import { toast } from "sonner";
import RevenuePieChart from "@/components/user/RevenuePieChart";

export default function UserDashboard() {
  const { bookings, loading, fetchBookings } = useBookings();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Refetch bookings when component mounts to ensure we have the latest data
    fetchBookings();
  }, []);

  // Calculate stats
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = booking.Booking_date ? parseISO(booking.Booking_date) : null;
    return bookingDate && isAfter(bookingDate, new Date());
  });

  const completedBookings = bookings.filter(booking => 
    booking.Status === "done" || booking.Status === "completed"
  );

  // Calculate total spent
  const totalSpent = completedBookings.reduce((total, booking) => {
    return total + (booking.price || 0);
  }, 0);

  const handleNewBooking = () => {
    navigate("/booking");
    toast({
      title: "Starting new booking",
      description: "Please fill in your service details",
    });
  };

  return (
    <ProtectedRoute allowedRoles={["member"]}>
      <DashboardLayout title={`Welcome, ${user?.firstName || 'Member'}`}>
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Member Dashboard</h2>
            <Button onClick={handleNewBooking} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Booking
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage your bookings and view your account information
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : bookings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                All your booking records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : upcomingBookings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Services scheduled from today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <IndianRupee className="h-4 w-4 mr-1 text-primary" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loading ? "..." : `₹${totalSpent.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Amount spent on services
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings Section */}
        {bookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">{booking.Purpose || booking.ServiceName || "Service Booking"}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {booking.Booking_date && format(parseISO(booking.Booking_date), 'PP')}
                        <Clock className="h-3 w-3 mx-1 ml-2" />
                        {booking.booking_time}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-medium">₹{booking.price?.toLocaleString('en-IN') || "N/A"}</div>
                      <span 
                        className={`text-xs px-2 py-1 rounded-full mt-1
                          ${booking.Status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                          booking.Status === 'done' || booking.Status === 'completed' ? 'bg-green-100 text-green-800' : 
                          booking.Status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          booking.Status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {booking.Status === 'done' || booking.Status === 'completed' ? 'Completed' : 
                         (booking.Status?.charAt(0).toUpperCase() + booking.Status?.slice(1)) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {bookings.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" onClick={() => navigate("/user/bookings")}>
                      View All Bookings
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Revenue by Service chart */}
        <div className="grid gap-8 md:grid-cols-1">
          <RevenuePieChart 
            bookings={bookings}
            loading={loading}
            title="Revenue by Service Type"
            description="Distribution of your spending on different service types"
          />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
