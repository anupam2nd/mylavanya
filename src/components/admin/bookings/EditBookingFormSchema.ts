
import { z } from "zod";

export const editBookingFormSchema = z.object({
  date: z.date({
    required_error: "Booking date is required",
  }),
  time: z.string({
    required_error: "Booking time is required",
  }),
  status: z.string({
    required_error: "Status is required",
  }),
});

export type EditBookingFormValues = z.infer<typeof editBookingFormSchema>;
