
import { z } from "zod";

export const bookingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string()
    .min(10, "Phone number must be exactly 10 digits")
    .max(10, "Phone number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time slot",
  }),
  notes: z.string().optional(),
  selectedServices: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number()
  })).min(1, "Please select at least one service"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", 
  "05:00 PM", "06:00 PM", "07:00 PM"
];

export interface BookingFormProps {
  serviceId?: number;
  serviceName?: string;
  servicePrice?: number; 
  onCancel?: () => void;
  onSuccess?: () => void;
  initialSelectedService?: {
    id: number;
    name: string;
    price: number;
  };
}

// Field required status information for UI rendering
export const requiredFields = {
  name: true,
  email: true,
  phone: true,
  date: true,
  time: true,
  notes: false,
  selectedServices: true
};
