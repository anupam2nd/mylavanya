
import * as z from "zod";

export const editBookingFormSchema = z.object({
  date: z.date().optional(),
  time: z.string().optional(),
  status: z.string().optional(),
  service: z.string().optional(),
  subService: z.string().optional(),
  product: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  artistId: z.number().int().positive().nullable().optional(),
  currentUser: z.object({
    Username: z.string().optional(),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
  }).nullable().optional()
});

export type EditBookingFormValues = z.infer<typeof editBookingFormSchema>;
