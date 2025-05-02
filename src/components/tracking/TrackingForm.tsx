
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Phone, Search } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const trackingFormSchema = z.object({
  bookingRef: z.string().min(1, { message: "Booking reference number is required" }),
  phone: z.string().min(10, { message: "Valid phone number is required" }),
});

export type TrackingFormValues = z.infer<typeof trackingFormSchema>;

interface TrackingFormProps {
  onSubmit: (data: TrackingFormValues) => Promise<void>;
  isLoading: boolean;
}

const TrackingForm = ({ onSubmit, isLoading }: TrackingFormProps) => {
  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      bookingRef: "",
      phone: "",
    },
  });

  const handleFormSubmit = async (data: TrackingFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
  );
};

export default TrackingForm;
