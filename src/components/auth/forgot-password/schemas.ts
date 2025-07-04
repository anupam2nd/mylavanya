
import { z } from "zod";

export const passwordSchema = z.string().min(4, "Password must be at least 4 characters");

export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
