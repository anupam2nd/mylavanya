
-- Create table for storing booking OTPs
CREATE TABLE public.booking_otps (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
  otp TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT fk_booking_id
    FOREIGN KEY (booking_id)
    REFERENCES public.BookMST(id)
    ON DELETE CASCADE
);

-- Add index for faster lookups
CREATE INDEX idx_booking_otps_booking_id ON public.booking_otps(booking_id);
CREATE INDEX idx_booking_otps_otp ON public.booking_otps(otp);
CREATE INDEX idx_booking_otps_expires_at ON public.booking_otps(expires_at);
