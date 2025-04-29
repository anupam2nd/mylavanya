
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";

const bookingPhoneSchema = z.object({
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits long",
  }),
});

export type PhoneFormValues = z.infer<typeof bookingPhoneSchema>;

interface PhoneTrackingFormProps {
  onSubmit: (values: PhoneFormValues) => void;
}

export function PhoneTrackingForm({ onSubmit }: PhoneTrackingFormProps) {
  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(bookingPhoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
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
  );
}
