
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, AlertTriangle, CreditCard, Calendar, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useUserBookings } from "@/hooks/useUserBookings";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonCustom } from "@/components/ui/button-custom";

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
          // Convert booking.id to a number if it's a string
          const bookingId = typeof booking.id === 'string' ? parseInt(booking.id) : booking.id;
          
          await supabase
            .from('BookMST')
            .update({ Status: 'confirmed' })
            .eq('id', bookingId);
        }
      }
      
      // Show success message
      setPaymentComplete(true);
      toast.success("Payment successful! Your bookings have been confirmed.");
      
      // Clear selected bookings
      setSelectedBookings([]);
      
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again later.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };
  
  // Navigate back to bookings
  const handleBackToBookings = () => {
    navigate('/user/bookings');
  };
  
  // Show payment success screen
  if (paymentComplete) {
    return (
      <ProtectedRoute allowedRoles={['member']}>
        <DashboardLayout title="Payment Successful">
          <div className="max-w-3xl mx-auto">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
                <p className="text-green-700 mb-6">Your booking has been confirmed. Thank you for your payment.</p>
                
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handleBackToBookings}
                  >
                    View Your Bookings
                  </Button>
                  <Button
                    onClick={() => navigate('/services')}
                  >
                    Book More Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Your Pending Bookings</h2>
                <div className="space-x-2">
                  {selectedBookings.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={deselectAllBookings}>
                      Deselect All
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={selectAllBookings}>
                      Select All
                    </Button>
                  )}
                </div>
              </div>
              
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Payment is required to confirm your bookings. Your appointment time will be reserved once payment is completed.
                </AlertDescription>
              </Alert>
              
              {Object.entries(bookingGroups).map(([bookingNo, group]) => (
                <Card key={bookingNo} className={selectedBookings.includes(bookingNo) ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedBookings.includes(bookingNo)}
                            onChange={() => toggleBookingSelection(bookingNo)}
                            id={`booking-${bookingNo}`}
                          />
                          <label htmlFor={`booking-${bookingNo}`} className="font-medium">
                            Booking #{bookingNo}
                          </label>
                          <Badge variant="outline" className="ml-2">
                            {group.length} {group.length === 1 ? 'service' : 'services'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(group[0].Booking_date), "MMMM d, yyyy")}
                            </span>
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3" />
                            <span>{group[0].booking_time}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {group[0].Address}, {group[0].Pincode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          ₹{calculateGroupTotal(group).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      {group.map(booking => (
                        <li key={booking.id} className="py-2">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{booking.Purpose}</p>
                              <div className="text-sm text-muted-foreground">
                                {booking.ServiceName && <span>{booking.ServiceName}</span>}
                                {booking.SubService && <span> - {booking.SubService}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p>₹{booking.price} × {booking.Qty || 1}</p>
                              <p className="font-medium">₹{((booking.price || 0) * (booking.Qty || 1)).toFixed(2)}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Selected Bookings</span>
                      <span>{selectedBookings.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>₹0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <ButtonCustom
                    className="w-full"
                    variant="primary-gradient"
                    size="lg"
                    disabled={selectedBookings.length === 0 || isPaymentProcessing}
                    onClick={handlePayment}
                  >
                    {isPaymentProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Make Payment (₹{calculateTotal().toFixed(2)})
                      </>
                    )}
                  </ButtonCustom>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToBookings}
                  >
                    Back to Bookings
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Checkout;
