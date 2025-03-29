
import { z } from "zod";

// Define a schema for selected service
const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  quantity: z.number().optional().default(1),
});

// Define schema for the booking form values
export const bookingFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  address: z.string().min(1, { message: "Address is required" }),
  pincode: z.string().min(1, { message: "Pincode is required" }),
  selectedDate: z.date({
    required_error: "Please select a date",
  }),
  selectedTime: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
  selectedServices: z.array(serviceSchema).min(1, { message: "Please select at least one service" }),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export interface BookingFormProps {
  serviceId?: number;
  serviceName?: string;
  servicePrice?: number;
  serviceOriginalPrice?: number; // Added this field
  onCancel?: () => void;
  onSuccess?: () => void;
}
