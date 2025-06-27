
import { z } from "zod";

export const registerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string()
    .min(10, "Phone number must be exactly 10 digits")
    .max(10, "Phone number must be exactly 10 digits")
    .regex(/^\d{10}$/, "Phone number must contain only digits"),
  address: z.string().min(1, "Address is required"),
  pincode: z.string().min(1, "Pincode is required").min(6, "Pincode must be at least 6 digits"),
  sex: z.enum(["Male", "Female", "Other"]),
  dob: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Date of birth is required",
  }),
  password: z.string().min(4, "Password must be at least 4 characters"),
  confirmPassword: z.string(),
  isPhoneVerified: z.boolean().refine(val => val === true, {
    message: "Phone number must be verified",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
