
import { z } from "zod";

// Define a schema for selected service
const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  quantity: z.number().optional().default(1),
});

// Define which fields are required in the form
export const requiredFields = {
  name: true,
  email: true,
  phone: true,
  address: true,
  pincode: true,
  selectedDate: true,
  selectedTime: true,
  notes: false,
  selectedServices: true
};

// Define available time slots in 12-hour format consistently
export const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", 
  "05:00 PM", "06:00 PM", "07:00 PM"
];

// Define schema for the booking form values
export const bookingFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }).transform(val => val.toLowerCase()),
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
  serviceOriginalPrice?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
}
