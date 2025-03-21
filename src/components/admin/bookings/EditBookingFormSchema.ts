
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
  // Adding read-only fields for display purposes
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  purpose: z.string().optional(),
  price: z.number().optional(),
});

export type EditBookingFormValues = z.infer<typeof editBookingFormSchema>;
