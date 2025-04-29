
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import BookingDetails from "./BookingDetails"; // Fixed import - it's a default export
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserIcon, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const bookingPhoneSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits long",
  }),
});

const bookingRefSchema = z.object({
  bookingRef: z.string().min(1, {
    message: "Please enter a booking reference",
  }),
});

export function BookingTrackingForm() {
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("phone");
  const { user } = useAuth();

  const phoneForm = useForm<z.infer<typeof bookingPhoneSchema>>({
    resolver: zodResolver(bookingPhoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const refForm = useForm<z.infer<typeof bookingRefSchema>>({
    resolver: zodResolver(bookingRefSchema),
    defaultValues: {
      bookingRef: "",
    },
  });

  function onPhoneSubmit(values: z.infer<typeof bookingPhoneSchema>) {
    // In a real implementation, you would fetch booking data based on the phone number
    console.log(values);
    setBookingDetails({
      bookingId: "123456",
      status: "In progress",
      service: "Premium Facial",
      date: "2023-04-15",
      time: "14:30",
      customerName: "Jane Doe",
      customerPhone: values.phoneNumber,
    });
  }

  function onRefSubmit(values: z.infer<typeof bookingRefSchema>) {
    // In a real implementation, you would fetch booking data based on the reference
    console.log(values);
    setBookingDetails({
      bookingId: values.bookingRef,
      status: "Confirmed",
      service: "Deep Cleansing Facial",
      date: "2023-04-20",
      time: "10:15",
      customerName: "John Smith",
      customerPhone: "9876543210",
    });
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setBookingDetails(null); // Reset booking details when switching tabs
  };

  // Transform the booking details into the format expected by BookingDetails component
  const transformBookingDetails = (details: any) => {
    if (!details) return [];
    
    // Create a BookingData array with a single entry that matches the expected interface
    return [{
      Booking_NO: details.bookingId || "",
      Purpose: details.service || "",
      Phone_no: parseInt(details.customerPhone) || 0,
      Booking_date: details.date || "",
      booking_time: details.time || "",
      Status: details.status || "",
      price: 0, // Default value as it's required
      ProductName: details.service || "",
      Qty: 1, // Default quantity
      name: details.customerName || ""
    }];
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Track Your Booking</h2>
        <p className="text-muted-foreground">
          Enter your phone number or booking reference to track your appointment
          status.
        </p>
      </div>

      {user && user.role === 'member' && (
        <div className="flex justify-center mb-4">
          <Button asChild className="w-full">
            <Link to="/user/bookings">
              View All My Bookings
            </Link>
          </Button>
        </div>
      )}

      <Tabs
        defaultValue="phone"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phone">Track by Phone</TabsTrigger>
          <TabsTrigger value="reference">Track by Reference</TabsTrigger>
        </TabsList>
        <TabsContent value="phone">
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
              className="space-y-4"
            >
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your phone number"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Track Booking
              </Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="reference">
          <Form {...refForm}>
            <form
              onSubmit={refForm.handleSubmit(onRefSubmit)}
              className="space-y-4"
            >
              <FormField
                control={refForm.control}
                name="bookingRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Reference</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your booking reference"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Track Booking
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>

      {bookingDetails && <BookingDetails bookingDetails={transformBookingDetails(bookingDetails)} />}
    </div>
  );
}
