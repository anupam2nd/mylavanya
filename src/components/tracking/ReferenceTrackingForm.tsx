
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
import { UserIcon } from "lucide-react";

const bookingRefSchema = z.object({
  bookingRef: z.string().min(1, {
    message: "Please enter a booking reference",
  }),
});

export type ReferenceFormValues = z.infer<typeof bookingRefSchema>;

interface ReferenceTrackingFormProps {
  onSubmit: (values: ReferenceFormValues) => void;
}

export function ReferenceTrackingForm({ onSubmit }: ReferenceTrackingFormProps) {
  const form = useForm<ReferenceFormValues>({
    resolver: zodResolver(bookingRefSchema),
    defaultValues: {
      bookingRef: "",
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
  );
}
