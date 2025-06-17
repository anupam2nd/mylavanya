import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/hooks/useBookings";

const formSchema = z.object({
  identifier: z.string().min(1, {
    message: "Booking number or phone number is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const BookingTrackingForm = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      const { data: bookingsData, error } = await supabase
        .from('BookMST')
        .select('*')
        .or(`Booking_NO.eq.${values.identifier},Phone_no.eq.${values.identifier}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!bookingsData || bookingsData.length === 0) {
        toast.error("No bookings found with this booking number or phone number.");
        return;
      }

      // Transform data to ensure Booking_NO is a string
      const transformedBookings = bookingsData.map(booking => ({
        ...booking,
        Booking_NO: booking.Booking_NO?.toString() || ''
      }));

      setBookings(transformedBookings);
      toast.success(`Found ${transformedBookings.length} booking(s)`);
    } catch (error) {
      toast.error("Error searching for bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking Number / Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter booking number or phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Track Booking"}
        </Button>
      </form>
    </Form>
  );
};

export default BookingTrackingForm;
