
import { z } from "zod";

export const registerFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be a 6-digit number"),
  sex: z.enum(["Male", "Female", "Other"]),
  dob: z.date({
    required_error: "Date of birth is required",
  }).refine(date => {
    // Check if the user is at least 7 years old
    const today = new Date();
    const sevenYearsAgo = new Date(today);
    sevenYearsAgo.setFullYear(today.getFullYear() - 7);
    return date <= sevenYearsAgo;
  }, "You must be at least 7 years old"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
