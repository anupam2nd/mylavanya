
-- Update the cleanup_expired_otps function to specifically target registration OTPs
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
  
  -- Additionally, clean up specifically registration OTPs that are older than 24 hours, 
  -- regardless of their verification status
  DELETE FROM public.service_otps
  WHERE status_type = 'registration'
  AND created_at < now() - interval '24 hours';
  
  RETURN deleted_count;
END;
$$;

-- Comment on the updated function
COMMENT ON FUNCTION public.cleanup_expired_otps() IS 'Removes all verified and expired OTPs from the service_otps table, with special handling for registration OTPs';

-- Ensure the cron job still exists (in case it was removed)
-- The cron job will run the cleanup function every hour
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-otps') THEN
    PERFORM cron.schedule(
      'cleanup-expired-otps',
      '0 * * * *', -- run every hour at minute 0
      'SELECT public.cleanup_expired_otps();'
    );
  END IF;
END $$;
