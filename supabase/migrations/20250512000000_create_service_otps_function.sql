
-- Create a function to create the service_otps table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_service_otps_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'service_otps'
  ) THEN
    -- Create the table
    CREATE TABLE public.service_otps (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL,
      otp_code TEXT NOT NULL,
      status_type TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      verified BOOLEAN DEFAULT false NOT NULL
    );
    
    -- Add index for faster lookups
    CREATE INDEX idx_service_otps_booking_id ON public.service_otps (booking_id);
    
    -- Add index for phone number lookup
    CREATE INDEX idx_service_otps_phone_number ON public.service_otps (phone_number);
  END IF;
END;
$$;
