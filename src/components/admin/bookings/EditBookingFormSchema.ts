
import { z } from "zod";

export const EditBookingFormSchema = z.object({
  date: z.date().optional(),
  time: z.string().optional(),
  status: z.string(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  service: z.string().optional(),
  subService: z.string().optional(),
  product: z.string().optional(),
  quantity: z.number().optional(),
  artistId: z.string().nullable(), // Changed from number to string
  currentUser: z.object({
    Username: z.string().optional(),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
  }).nullable().optional(),
});

export type EditBookingFormValues = z.infer<typeof EditBookingFormSchema>;
