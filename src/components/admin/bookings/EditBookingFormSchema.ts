
import { z } from "zod";

export const editBookingFormSchema = z.object({
  date: z.date().optional(),
  time: z.string().optional(),
  status: z.string().min(1, "Please select a status"),
  address: z.string().optional(),
  pincode: z.string().optional(),
  artistId: z.number().nullable().optional(),
  currentUser: z.object({
    Username: z.string().optional(),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
  }).optional().nullable(),
});

export type EditBookingFormValues = z.infer<typeof editBookingFormSchema>;
