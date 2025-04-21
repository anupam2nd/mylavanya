
import * as z from "zod";

// Basic fields validation
export const artistSchema = z.object({
  ArtistFirstName: z.string().min(1, "First name is required"),
  ArtistLastName: z.string().min(1, "Last name is required"),
  ArtistEmpCode: z.string().optional(),
  emailid: z.string().email("Please enter a valid email address"),
  ArtistPhno: z.string().refine(
    (val) => !isNaN(Number(val)) && val.length >= 10,
    { message: "Please enter a valid phone number" }
  ),
  Artistgrp: z.string().optional(),
  Source: z.string().optional(),
  ArtistRating: z.string().optional()
    .refine(
      (val) => val === '' || val === undefined || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 5),
      { message: "Rating must be between 0 and 5" }
    ),
  Active: z.boolean().default(true),
  password: z.string().optional()
});

// Extended schema for new artist with required password
export const fullArtistSchema = artistSchema.extend({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
});

export type ArtistFormValues = z.infer<typeof artistSchema>;
