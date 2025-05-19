
-- Create a function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE 
  deleted_count integer;
BEGIN
  -- Delete OTPs that are already verified
  DELETE FROM public.service_otps
  WHERE verified = true;
  
  -- Delete OTPs that have expired
  WITH deleted AS (
    DELETE FROM public.service_otps
    WHERE expires_at < now()
    RETURNING *
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;

-- Comment on the function
COMMENT ON FUNCTION public.cleanup_expired_otps() IS 'Removes all verified and expired OTPs from the service_otps table';

-- Create a cron job to clean up expired OTPs every hour
SELECT cron.schedule(
  'cleanup-expired-otps', -- name of the cron job
  '0 * * * *', -- run every hour at minute 0
  'SELECT public.cleanup_expired_otps();' -- SQL command to execute
);
