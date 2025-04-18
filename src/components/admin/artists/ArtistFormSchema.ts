
import * as z from "zod";

export const artistSchema = z.object({
  ArtistFirstName: z.string().min(1, "First name is required"),
  ArtistLastName: z.string().min(1, "Last name is required"),
  ArtistEmpCode: z.string().optional(),
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
  Active: z.boolean().default(true)
});

export type ArtistFormValues = z.infer<typeof artistSchema>;
