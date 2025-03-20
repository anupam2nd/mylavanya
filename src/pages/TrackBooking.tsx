
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Phone, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

const trackingFormSchema = z.object({
  bookingRef: z.string().min(1, { message: "Booking reference number is required" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

interface BookingDetails {
  Booking_NO: string;
  Purpose: string;
  Phone_no: number;
  Booking_date: string;
  booking_time: string;
  Status: string;
  price: number;
  ProductName: string;
  Qty: number; // Added Qty field
}

const TrackBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      bookingRef: "",
      phone: "",
    },
  });

  const onSubmit = async (data: TrackingFormValues) => {
    setIsLoading(true);
    setError(null);
    setBookingDetails(null);
    
    try {
      // Convert phone to number for comparison with the database
      const phoneNumber = parseInt(data.phone.replace(/\D/g, ''));
      
      // First get the booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("BookMST")
        .select("*")
        .eq("Booking_NO", data.bookingRef)
        .eq("Phone_no", phoneNumber)
        .maybeSingle();

      if (bookingError) {
        throw bookingError;
      }

      if (!bookingData) {
        setError("No booking found with the provided details. Please check and try again.");
        return;
      }

      // Get the service details
      const { data: serviceData, error: serviceError } = await supabase
        .from("PriceMST")
        .select("ProductName")
        .eq("prod_id", bookingData.Product)
        .maybeSingle();

      if (serviceError) {
        throw serviceError;
      }

      // Combine booking and service data
      setBookingDetails({
        ...bookingData,
        ProductName: serviceData?.ProductName || "Unknown Service",
      });

    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Failed to retrieve booking information. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to retrieve booking information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-3">Track Your Booking</h1>
            <p className="text-gray-600">
              Enter your booking reference number and phone number to check the status of your booking.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Booking Tracker</CardTitle>
              <CardDescription>
                Please enter the details below to track your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bookingRef"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-red-500">* </span>
                            Booking Reference No.
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input className="pl-10" placeholder="Enter booking reference" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <span className="text-red-500">* </span>
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                              <Input 
                                className="pl-10" 
                                placeholder="Enter phone number" 
                                {...field}
                                type="tel"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2">Tracking...</span>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" /> Track Booking
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {bookingDetails && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
                  <div className="bg-gray-50 rounded-lg border p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 bg-primary/10 p-4 rounded-md border border-primary/20 mb-2">
                        <p className="text-sm font-medium text-gray-500">Booking Reference</p>
                        <p className="text-xl font-bold text-red-600">{bookingDetails.Booking_NO}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Service</p>
                        <p className="font-medium">{bookingDetails.ProductName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Purpose</p>
                        <p className="font-medium">{bookingDetails.Purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="font-medium">{bookingDetails.Phone_no}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Quantity</p>
                        <p className="font-medium">{bookingDetails.Qty || 1}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Unit Price</p>
                        <p className="font-medium">₹{bookingDetails.price?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                        <p className="font-medium">₹{((bookingDetails.Qty || 1) * bookingDetails.price)?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking Date</p>
                        <p className="font-medium">{bookingDetails.Booking_date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Booking Time</p>
                        <p className="font-medium">{bookingDetails.booking_time}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                          ${bookingDetails.Status === 'completed' ? 'bg-green-100 text-green-800' : 
                            bookingDetails.Status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {bookingDetails.Status?.toUpperCase() || 'PENDING'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrackBooking;
