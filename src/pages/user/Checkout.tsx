
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Loader2, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useUserBookings } from "@/hooks/useUserBookings";
import { PaymentSuccessView } from "@/components/checkout/PaymentSuccessView";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { BookingGroupCard } from "@/components/checkout/BookingGroupCard";
import { TotalsSummary } from "@/components/checkout/TotalsSummary";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const { bookings, loading } = useUserBookings();
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Filter pending bookings - only show bookings that haven't been paid
  const pendingBookings = bookings.filter(booking => 
    booking.Status === 'pending' || booking.Status === 'awaiting_payment'
  );
  
  // Group bookings by booking reference number
  const bookingGroups = pendingBookings.reduce((groups: Record<string, typeof pendingBookings>, booking) => {
    const key = booking.Booking_NO || '';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(booking);
    return groups;
  }, {});
  
  // Calculate total for each booking group
  const calculateGroupTotal = (bookingGroup: typeof pendingBookings) => {
    return bookingGroup.reduce((sum, booking) => {
      const price = booking.price || 0;
      const quantity = booking.Qty || 1;
      return sum + (price * quantity);
    }, 0);
  };
  
  // Calculate overall total for selected bookings
  const calculateTotal = () => {
    return Object.entries(bookingGroups)
      .filter(([bookingNo]) => selectedBookings.includes(bookingNo))
      .reduce((sum, [_, group]) => sum + calculateGroupTotal(group), 0);
  };
  
  // Handle selecting/deselecting a booking group
  const toggleBookingSelection = (bookingNo: string) => {
    if (selectedBookings.includes(bookingNo)) {
      setSelectedBookings(selectedBookings.filter(no => no !== bookingNo));
    } else {
      setSelectedBookings([...selectedBookings, bookingNo]);
    }
  };
  
  // Select all pending bookings
  const selectAllBookings = () => {
    setSelectedBookings(Object.keys(bookingGroups));
  };
  
  // Deselect all bookings
  const deselectAllBookings = () => {
    setSelectedBookings([]);
  };

  // Handle service deletion
  const handleDeleteService = async (booking: any) => {
    if (!window.confirm('Are you sure you want to remove this service?')) {
      return;
    }

    try {
      const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
      
      const { error } = await supabase
        .from('BookMST')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      toast.success("Service removed successfully");
      
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error("Failed to remove service");
    }
  };
  
  // Process payment for selected bookings
  const handlePayment = async () => {
    if (selectedBookings.length === 0) {
      toast.error("Please select at least one booking to pay for");
      return;
    }
    
    setIsPaymentProcessing(true);
    
    try {
      // Simulate payment processing - in a real app, this would integrate with a payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update booking status to 'confirmed' after successful payment
      for (const bookingNo of selectedBookings) {
        const bookingGroup = bookingGroups[bookingNo];
        
        for (const booking of bookingGroup) {
          const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
          
          await supabase
            .from('BookMST')
            .update({ Status: 'confirmed' })
            .eq('id', bookingId);
        }
      }
      
      setPaymentComplete(true);
      toast.success("Payment successful! Your bookings have been confirmed.");
      setSelectedBookings([]);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again later.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  // Show payment success screen
  if (paymentComplete) {
    return (
      <ProtectedRoute allowedRoles={['member']}>
        <DashboardLayout title="Payment Successful">
          <PaymentSuccessView />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute allowedRoles={['member']}>
      <DashboardLayout title="Checkout">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading your bookings...</span>
            </div>
          ) : pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-medium mb-2">No Pending Bookings</h2>
                <p className="text-gray-500 mb-6">You don't have any bookings ready for payment.</p>
                <Button onClick={() => navigate('/services')}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <CheckoutHeader 
                selectedCount={selectedBookings.length}
                onSelectAll={selectAllBookings}
                onDeselectAll={deselectAllBookings}
              />
              
              {Object.entries(bookingGroups).map(([bookingNo, group]) => (
                <BookingGroupCard
                  key={bookingNo}
                  bookingNo={bookingNo}
                  group={group}
                  isSelected={selectedBookings.includes(bookingNo)}
                  onSelect={toggleBookingSelection}
                  onDeleteService={handleDeleteService}
                  calculateGroupTotal={calculateGroupTotal}
                />
              ))}
              
              <TotalsSummary 
                selectedCount={selectedBookings.length}
                total={calculateTotal()}
                isProcessing={isPaymentProcessing}
                onPayment={handlePayment}
                onBackToBookings={() => navigate('/user/bookings')}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Checkout;
