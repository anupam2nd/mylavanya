
-- Create functions for OTP handling

-- Function to insert a new OTP for a booking
CREATE OR REPLACE FUNCTION public.insert_booking_otp(
  p_booking_id INTEGER,
  p_otp TEXT,
  p_expires_at TIMESTAMPTZ
) RETURNS VOID AS $$
BEGIN
  -- Delete any existing OTPs for this booking
  DELETE FROM public.booking_otps
  WHERE booking_id = p_booking_id;
  
  -- Insert the new OTP
  INSERT INTO public.booking_otps (
    booking_id, 
    otp, 
    created_at, 
    expires_at
  ) 
  VALUES (
    p_booking_id,
    p_otp,
    now(),
    p_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify an OTP for a booking
CREATE OR REPLACE FUNCTION public.verify_booking_otp(
  p_booking_id INTEGER,
  p_otp TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_otp_record RECORD;
  v_result BOOLEAN;
BEGIN
  -- Find the OTP record
  SELECT * INTO v_otp_record
  FROM public.booking_otps
  WHERE booking_id = p_booking_id
    AND otp = p_otp
    AND expires_at > now();
  
  IF v_otp_record IS NULL THEN
    v_result := FALSE;
  ELSE
    -- Delete the used OTP
    DELETE FROM public.booking_otps
    WHERE booking_id = p_booking_id;
    
    v_result := TRUE;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
